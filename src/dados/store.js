/**
 * Camada de dados dos agendamentos.
 *
 * Trabalha em dois modos, decididos sozinho no boot:
 *
 * - **Nuvem** (`/api/agendamentos` respondendo): a agenda é a mesma para todo
 *   mundo, então o que o cliente marca no celular dele aparece no painel do
 *   barbeiro. É o modo normal em produção.
 * - **Local** (sem banco configurado): cai no localStorage, como antes. Serve
 *   para desenvolver e impede que o site do cliente saia do ar se o banco
 *   estiver fora.
 *
 * Nenhum componente sabe em qual modo está — todos chamam as mesmas funções.
 * Quem lê continua lendo de forma síncrona, de um retrato em memória; quem
 * escreve é que virou assíncrono.
 *
 * Privacidade: o site público nunca baixa a agenda cheia. Para montar a grade
 * de horários ele pede só a lista de "dia, hora e profissional ocupados" —
 * nome e telefone de outros clientes só saem do servidor com a senha do
 * painel.
 */
import { CONFIG, STATUS } from '../config.js'
import { servicos, barbeiros, servicoPor, barbeiroPor } from './catalogo.js'
import * as nuvem from './nuvem.js'

const CHAVE = CONFIG.chaveArmazenamento

/* avisa a tela quando os dados mudam (o painel escuta pra se redesenhar) */
const EVENTO = 'agendamentos-mudaram'

const avisar = () => window.dispatchEvent(new Event(EVENTO))

/* ------------------------------------------------------ retrato em memória */

function lerLocal() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || []
  } catch {
    return []
  }
}

/** agenda cheia: no modo local vem do navegador, na nuvem vem do servidor */
let cache = lerLocal()
/** só "dia + hora + profissional", que é o que o site público precisa saber */
let tomados = []

export function listar() {
  return cache
}

export function gravar(lista) {
  cache = lista
  if (!nuvem.disponivel()) localStorage.setItem(CHAVE, JSON.stringify(lista))
  avisar()
}

export function aoMudar(callback) {
  window.addEventListener(EVENTO, callback)
  return () => window.removeEventListener(EVENTO, callback)
}

export const naNuvem = () => nuvem.disponivel()

/* ------------------------------------------------------------ boot / sync */

/**
 * Descobre o modo e carrega o que dá sem senha. Chamado uma vez no arranque.
 */
export async function iniciar() {
  await nuvem.verificar()
  if (nuvem.disponivel()) {
    cache = [] // a agenda cheia só chega depois do login
    await recarregarOcupados()
  }
  avisar()
}

async function recarregarOcupados() {
  try {
    tomados = await nuvem.buscarOcupados()
  } catch {
    /* rede caiu no meio: seguimos com a última grade conhecida */
  }
}

/** Puxa a agenda completa do servidor. Só funciona depois do login. */
export async function recarregarAgenda() {
  if (!nuvem.disponivel()) return
  cache = await nuvem.buscarAgenda()
  tomados = cache
    .filter((a) => a.status !== 'canc')
    .map((a) => ({ data: a.data, hora: a.hora, barb: a.barb }))
  avisar()
}

/* --------------------------------------------------------------- horários */

/** Data de hoje em AAAA-MM-DD, respeitando o fuso local (não o UTC). */
export function hojeISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().split('T')[0]
}

export const dinheiro = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR')

/** Horários já tomados de um profissional num dia (cancelado não conta). */
export function ocupados(data, barbeiroId) {
  if (!barbeiroId) return []
  if (nuvem.disponivel())
    return tomados.filter((t) => t.data === data && t.barb === barbeiroId).map((t) => t.hora)

  return cache
    .filter((a) => a.data === data && a.barb === barbeiroId && a.status !== 'canc')
    .map((a) => a.hora)
}

/** Todos os horários do expediente daquele dia, marcando os ocupados. */
export function horariosDoDia(data, barbeiroId) {
  if (!data) return []
  const faixa = CONFIG.expediente[new Date(data + 'T00:00:00').getDay()]
  if (!faixa) return []

  const jaTomados = ocupados(data, barbeiroId)
  const lista = []
  for (let min = faixa[0] * 60; min < faixa[1] * 60; min += CONFIG.intervaloMin) {
    const hora = `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
    lista.push({ hora, livre: !jaTomados.includes(hora) })
  }
  return lista
}

export const abertoEm = (data) => !!CONFIG.expediente[new Date(data + 'T00:00:00').getDay()]

/* -------------------------------------------------------------- marcar */

/**
 * Grava um agendamento. Devolve { ok, erro, agendamento }.
 * Sem profissional escolhido, aloca o primeiro que estiver livre no horário.
 */
export async function agendar({ nome, tel, serv, barb, data, hora, obs }) {
  if (!nome || !tel || !serv || !data || !hora)
    return { ok: false, erro: 'Preencha todos os campos obrigatórios.' }

  if (!abertoEm(data)) return { ok: false, erro: 'Não atendemos nesse dia. Escolha outra data.' }

  /* na nuvem, a grade pode ter envelhecido enquanto a pessoa preenchia */
  if (nuvem.disponivel()) await recarregarOcupados()

  let escolhido = barb
  if (!escolhido) {
    const livre = barbeiros().find((b) => !ocupados(data, b.id).includes(hora))
    if (!livre)
      return { ok: false, erro: 'Todos os profissionais já estão ocupados nesse horário.' }
    escolhido = livre.id
  } else if (ocupados(data, escolhido).includes(hora)) {
    return { ok: false, erro: 'Esse horário acabou de ser preenchido. Escolha outro.' }
  }

  const s = servicoPor(serv)
  const b = barbeiroPor(escolhido)
  const agendamento = {
    id: Date.now(),
    nome,
    tel,
    barb: escolhido,
    barbNome: b.nome,
    serv,
    servNome: s.nome,
    preco: s.preco,
    dur: s.dur,
    data,
    hora,
    obs: obs || '',
    status: 'pend',
    criadoEm: new Date().toISOString(),
  }

  if (nuvem.disponivel()) {
    try {
      const r = await nuvem.marcar(agendamento)
      await recarregarOcupados()
      avisar()
      return { ok: true, agendamento: r.agendamento || agendamento }
    } catch (e) {
      /* 409 é a corrida por horário: a mensagem do servidor já explica */
      if (e.status === 409) return { ok: false, erro: e.message }
      return {
        ok: false,
        erro: 'Não conseguimos falar com a agenda agora. Tente de novo em instantes.',
      }
    }
  }

  gravar([...cache, agendamento])
  return { ok: true, agendamento }
}

/* --------------------------------------------------------- ações do painel */

export async function mudarStatus(id, status) {
  if (nuvem.disponivel()) {
    await nuvem.trocarStatus(id, status)
    await recarregarAgenda()
    return
  }
  gravar(cache.map((a) => (a.id === id ? { ...a, status } : a)))
}

export async function excluir(id) {
  if (nuvem.disponivel()) {
    await nuvem.apagar(id)
    await recarregarAgenda()
    return
  }
  gravar(cache.filter((a) => a.id !== id))
}

export async function limparTudo() {
  if (nuvem.disponivel()) {
    await nuvem.apagarTudo()
    await recarregarAgenda()
    return
  }
  gravar([])
}

/** Mensagem pronta de WhatsApp com os dados do agendamento. */
export function linkWhatsapp(a, nomeDaCasa) {
  const dataFmt = new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')
  const txt =
    `Olá! Quero confirmar meu horário na ${nomeDaCasa}:\n\n` +
    `👤 ${a.nome}\n✂ ${a.servNome} (R$${a.preco})\n💈 ${a.barbNome}\n📅 ${dataFmt} às ${a.hora}` +
    (a.obs ? `\n📝 ${a.obs}` : '')
  return `https://wa.me/${CONFIG.whatsappNumero}?text=${encodeURIComponent(txt)}`
}

/* ---------------- números do painel ---------------- */

const ativos = (lista) => lista.filter((a) => a.status !== 'canc')

export function resumo() {
  const todos = listar()
  const at = ativos(todos)
  const receita = at.reduce((s, a) => s + a.preco, 0)
  const hoje = hojeISO()

  return {
    total: todos.length,
    receita,
    hoje: todos.filter((a) => a.data === hoje && a.status !== 'canc').length,
    pendentes: todos.filter((a) => a.status === 'pend').length,
    ticket: at.length ? Math.round(receita / at.length) : 0,
    ativos: at.length,
  }
}

export function receitaPorServico() {
  const at = ativos(listar())
  return servicos().map((s) => ({
    id: s.id,
    nome: s.nome,
    total: at.filter((a) => a.serv === s.id).reduce((x, a) => x + a.preco, 0),
    n: at.filter((a) => a.serv === s.id).length,
  }))
}

export function receitaPorBarbeiro() {
  const at = ativos(listar())
  return barbeiros()
    .map((b) => ({
      id: b.id,
      nome: b.nome,
      total: at.filter((a) => a.barb === b.id).reduce((x, a) => x + a.preco, 0),
      n: at.filter((a) => a.barb === b.id).length,
    }))
    .sort((x, y) => y.total - x.total)
}

export function agendaDeHoje() {
  const hoje = hojeISO()
  return listar()
    .filter((a) => a.data === hoje && a.status !== 'canc')
    .sort((a, b) => a.hora.localeCompare(b.hora))
}

/** Planilha CSV com BOM, pra abrir no Excel sem quebrar acento. */
export function exportarCsv() {
  const lista = listar()
  if (!lista.length) return false

  const cabecalho = [
    'Nome', 'Telefone', 'Profissional', 'Servico', 'Valor',
    'Duracao', 'Data', 'Hora', 'Status', 'Observacoes',
  ]
  const linhas = lista.map((a) =>
    [a.nome, a.tel, a.barbNome, a.servNome, a.preco, a.dur, a.data, a.hora, STATUS[a.status].lbl, a.obs]
      .map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`)
      .join(',')
  )

  const csv = '﻿' + [cabecalho.join(','), ...linhas].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'agendamentos.csv'
  a.click()
  URL.revokeObjectURL(url)
  return true
}

/** Agenda fictícia para demonstrar o painel cheio numa reunião. */
export async function gerarExemplos() {
  const nomes = [
    'João Vitor', 'Marcelo Souza', 'Diego Ramos', 'Anderson Luiz',
    'Felipe Cardoso', 'Bruno Martins', 'Rodrigo Alves', 'Tiago Nunes',
    'Wesley Prado', 'Caio Ferreira', 'Igor Bastos', 'Murilo Reis',
  ]
  const lista = [...listar()]
  const base = new Date()
  const cardapio = servicos()
  const equipe = barbeiros()

  nomes.forEach((nome, i) => {
    const s = cardapio[Math.floor(Math.random() * cardapio.length)]
    const b = equipe[Math.floor(Math.random() * equipe.length)]

    const d = new Date(base)
    d.setDate(base.getDate() + (i % 7) - 2)
    let voltas = 0
    while (!CONFIG.expediente[d.getDay()] && voltas++ < 7) d.setDate(d.getDate() + 1)
    const faixa = CONFIG.expediente[d.getDay()]
    if (!faixa) return

    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    const data = d.toISOString().split('T')[0]
    const h = faixa[0] + Math.floor(Math.random() * (faixa[1] - faixa[0]))
    const hora = `${String(h).padStart(2, '0')}:${Math.random() < 0.5 ? '00' : '30'}`

    if (lista.some((a) => a.data === data && a.hora === hora && a.barb === b.id)) return

    const passado = data < hojeISO()
    lista.push({
      id: Date.now() + i,
      nome,
      tel: `(00) 9${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}`,
      barb: b.id,
      barbNome: b.nome,
      serv: s.id,
      servNome: s.nome,
      preco: s.preco,
      dur: s.dur,
      data,
      hora,
      obs: '',
      status: passado ? 'concl' : Math.random() < 0.4 ? 'pend' : 'conf',
      criadoEm: new Date().toISOString(),
    })
  })

  if (nuvem.disponivel()) {
    await nuvem.substituir(lista)
    await recarregarAgenda()
    return
  }
  gravar(lista)
}
