/**
 * Cardápio de serviços e equipe — a parte editável pelo painel.
 *
 * As listas de `config.js` são só o ponto de partida. Assim que o dono salva
 * alguma alteração no painel, passa a valer o que está no localStorage; até
 * lá, valem os padrões. Nada aqui é lido em tempo de importação: tudo é
 * função, senão a tela ficaria com a versão antiga depois de uma edição.
 */
import { useEffect, useMemo, useState } from 'react'
import { CONFIG, SERVICOS_PADRAO, BARBEIROS_PADRAO } from '../config.js'

const CHAVE = CONFIG.chaveArmazenamento + '-catalogo'
const EVENTO = 'catalogo-mudou'

function ler() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || {}
  } catch {
    return {}
  }
}

/* uma lista vazia no armazenamento cairia num site sem serviço nenhum, então
   nesse caso o padrão volta a valer */
const ouPadrao = (lista, padrao) => (Array.isArray(lista) && lista.length ? lista : padrao)

export const servicos = () => ouPadrao(ler().servicos, SERVICOS_PADRAO)
export const barbeiros = () => ouPadrao(ler().barbeiros, BARBEIROS_PADRAO)

export const servicoPor = (id) => servicos().find((s) => s.id === id)
export const barbeiroPor = (id) => barbeiros().find((b) => b.id === id)

/** Grava o que veio do painel. O que não for passado fica como estava. */
export function salvarCatalogo({ servicos: novosServicos, barbeiros: novosBarbeiros }) {
  const atual = ler()
  localStorage.setItem(
    CHAVE,
    JSON.stringify({
      servicos: novosServicos || atual.servicos,
      barbeiros: novosBarbeiros || atual.barbeiros,
    })
  )
  window.dispatchEvent(new Event(EVENTO))
}

/** Joga fora as edições e devolve o cardápio de fábrica. */
export function restaurarPadrao() {
  localStorage.removeItem(CHAVE)
  window.dispatchEvent(new Event(EVENTO))
}

export const temEdicao = () => !!localStorage.getItem(CHAVE)

/**
 * Avisa quando o catálogo muda. O evento próprio cobre a mesma aba; o
 * `storage` cobre a outra aba — quem edita no painel costuma deixar o site
 * aberto do lado para conferir.
 */
export function aoMudarCatalogo(callback) {
  const doOutroLado = (e) => {
    if (e.key === CHAVE) callback()
  }
  window.addEventListener(EVENTO, callback)
  window.addEventListener('storage', doOutroLado)
  return () => {
    window.removeEventListener(EVENTO, callback)
    window.removeEventListener('storage', doOutroLado)
  }
}

/** Serviços e equipe atuais, redesenhando a tela quando o painel salva. */
export function useCatalogo() {
  const [versao, setVersao] = useState(0)
  useEffect(() => aoMudarCatalogo(() => setVersao((v) => v + 1)), [])
  return useMemo(() => ({ servicos: servicos(), barbeiros: barbeiros() }), [versao])
}

/** Id novo a partir do nome ("Corte Infantil" → "corte-infantil"). */
export function novoId(nome, existentes) {
  const base =
    nome
      .toLowerCase()
      /* NFD separa o acento da letra; fora do ASCII sobra só o acento solto,
         que é jogado fora aqui para "josé" virar "jose", não "jos-e" */
      .normalize('NFD')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'item'

  let id = base
  let n = 2
  while (existentes.includes(id)) id = `${base}-${n++}`
  return id
}
