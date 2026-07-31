/**
 * Conversa com a agenda compartilhada (`/api/agendamentos`).
 *
 * Este arquivo só sabe falar HTTP: quem decide entre nuvem e navegador é o
 * `store.js`. Se a API responder que não há banco configurado, ou se der
 * qualquer erro de rede, `disponivel()` fica falso e o sistema segue
 * funcionando local — o site do cliente nunca sai do ar por causa disso.
 */
const ROTA = '/api/agendamentos'

let ligada = null // null = ainda não perguntamos
let senhaAdmin = ''

export const disponivel = () => ligada === true
export const jaVerificou = () => ligada !== null

/** A senha fica só em memória: recarregou a aba, o painel pede de novo. */
export const guardarSenha = (s) => {
  senhaAdmin = s
}
export const temSenha = () => !!senhaAdmin

const cabecalhos = () => ({ 'Content-Type': 'application/json', 'x-senha': senhaAdmin })

async function chamar(opcoes = {}, rota = ROTA) {
  const r = await fetch(rota, { headers: cabecalhos(), ...opcoes })
  const corpo = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error(corpo.erro || `Erro ${r.status}`), { status: r.status })
  return corpo
}

/**
 * Descobre se existe banco do outro lado. Pergunta pelos horários ocupados
 * porque essa é a única rota que responde sem senha.
 */
export async function verificar() {
  try {
    const r = await chamar({ method: 'GET' }, `${ROTA}?ocupados=1`)
    ligada = r.configurado === true
  } catch {
    ligada = false
  }
  return ligada
}

/** Horários já tomados, sem exigir senha — é o que o site precisa saber. */
export async function buscarOcupados() {
  const r = await chamar({ method: 'GET' }, `${ROTA}?ocupados=1`)
  return r.ocupados || []
}

/** A agenda completa, com dados do cliente. Só com senha. */
export async function buscarAgenda() {
  const r = await chamar({ method: 'GET' })
  return r.agendamentos || []
}

export const conferirSenha = () => chamar({ method: 'POST', body: JSON.stringify({ acao: 'entrar' }) })

export const marcar = (agendamento) =>
  chamar({ method: 'POST', body: JSON.stringify(agendamento) })

export const trocarStatus = (id, status) =>
  chamar({ method: 'PATCH', body: JSON.stringify({ id, status }) })

export const apagar = (id) => chamar({ method: 'DELETE', body: JSON.stringify({ id }) })

export const apagarTudo = () => chamar({ method: 'DELETE', body: JSON.stringify({ tudo: true }) })

export const substituir = (agendamentos) =>
  chamar({ method: 'PUT', body: JSON.stringify({ agendamentos }) })
