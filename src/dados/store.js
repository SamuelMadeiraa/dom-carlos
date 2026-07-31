/**
 * Camada de dados dos agendamentos.
 *
 * Fica tudo em localStorage: o sistema roda sem back-end e sem banco, que é o
 * que mantém o custo do cliente na hospedagem estática. Se um dia precisar de
 * agenda compartilhada entre aparelhos, é este arquivo que troca de
 * implementação — nenhum componente fala com o localStorage direto.
 */
import { CONFIG, STATUS, servicoPor, barbeiroPor, SERVICOS, BARBEIROS } from '../config.js'

const CHAVE = CONFIG.chaveArmazenamento

/* avisa a tela quando os dados mudam (o painel escuta pra se redesenhar) */
const EVENTO = 'agendamentos-mudaram'

export function listar() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || []
  } catch {
    return []
  }
}

export function gravar(lista) {
  localStorage.setItem(CHAVE, JSON.stringify(lista))
  window.dispatchEvent(new Event(EVENTO))
}

export function aoMudar(callback) {
  window.addEventListener(EVENTO, callback)
  return () => window.removeEventListener(EVENTO, callback)
}

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
  return listar()
    .filter((a) => a.data === data && a.barb === barbeiroId && a.status !== 'canc')
    .map((a) => a.hora)
}

/** Todos os horários do expediente daquele dia, marcando os ocupados. */
export function horariosDoDia(data, barbeiroId) {
  if (!data) return []
  const faixa = CONFIG.expediente[new Date(data + 'T00:00:00').getDay()]
  if (!faixa) return []

  const tomados = ocupados(data, barbeiroId)
  const lista = []
  for (let min = faixa[0] * 60; min < faixa[1] * 60; min += CONFIG.intervaloMin) {
    const hora = `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
    lista.push({ hora, livre: !tomados.includes(hora) })
  }
  return lista
}

export const abertoEm = (data) => !!CONFIG.expediente[new Date(data + 'T00:00:00').getDay()]

/**
 * Grava um agendamento. Devolve { ok, erro, agendamento }.
 * Sem profissional escolhido, aloca o primeiro que estiver livre no horário.
 */
export function agendar({ nome, tel, serv, barb, data, hora, obs }) {
  if (!nome || !tel || !serv || !data || !hora)
    return { ok: false, erro: 'Preencha todos os campos obrigatórios.' }

  if (!abertoEm(data)) return { ok: false, erro: 'Não atendemos nesse dia. Escolha outra data.' }

  let escolhido = barb
  if (!escolhido) {
    const livre = BARBEIROS.find((b) => !ocupados(data, b.id).includes(hora))
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

  gravar([...listar(), agendamento])
  return { ok: true, agendamento }
}

export function mudarStatus(id, status) {
  gravar(listar().map((a) => (a.id === id ? { ...a, status } : a)))
}

export function excluir(id) {
  gravar(listar().filter((a) => a.id !== id))
}

export function limparTudo() {
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
  return SERVICOS.map((s) => ({
    id: s.id,
    nome: s.nome,
    total: at.filter((a) => a.serv === s.id).reduce((x, a) => x + a.preco, 0),
    n: at.filter((a) => a.serv === s.id).length,
  }))
}

export function receitaPorBarbeiro() {
  const at = ativos(listar())
  return BARBEIROS.map((b) => ({
    id: b.id,
    nome: b.nome,
    total: at.filter((a) => a.barb === b.id).reduce((x, a) => x + a.preco, 0),
    n: at.filter((a) => a.barb === b.id).length,
  })).sort((x, y) => y.total - x.total)
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
export function gerarExemplos() {
  const nomes = [
    'João Vitor', 'Marcelo Souza', 'Diego Ramos', 'Anderson Luiz',
    'Felipe Cardoso', 'Bruno Martins', 'Rodrigo Alves', 'Tiago Nunes',
    'Wesley Prado', 'Caio Ferreira', 'Igor Bastos', 'Murilo Reis',
  ]
  const lista = listar()
  const base = new Date()

  nomes.forEach((nome, i) => {
    const s = SERVICOS[Math.floor(Math.random() * SERVICOS.length)]
    const b = BARBEIROS[Math.floor(Math.random() * BARBEIROS.length)]

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

  gravar(lista)
}
