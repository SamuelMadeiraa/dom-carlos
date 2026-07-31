/**
 * Agenda compartilhada — função serverless da Vercel.
 *
 * É o que faz o agendamento sair do navegador do cliente e chegar no painel
 * do barbeiro. Sem isso, cada visitante gravava a reserva só na própria
 * máquina e o dono nunca via nada.
 *
 * O armazenamento é um Redis da Upstash, falado pela API REST — sem SDK, sem
 * dependência nova no projeto. A agenda inteira mora numa chave só: uma
 * barbearia gera algumas centenas de linhas por ano, não vale a complexidade
 * de um registro por chave.
 *
 * Se as variáveis de ambiente não estiverem configuradas, a função responde
 * `configurado: false` e o site volta a trabalhar sozinho no navegador — o
 * site nunca quebra por falta de banco.
 */

/* a Vercel injeta KV_* na integração antiga e UPSTASH_* na do Marketplace */
const URL_BASE = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ''
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''
const CHAVE = process.env.CHAVE_AGENDA || 'doncarlos:agendamentos'

/* a senha do painel passa a viver no servidor; o valor de fábrica só existe
   para quem ainda não definiu a variável na Vercel */
const SENHA = process.env.ADMIN_SENHA || 'barber123'

const configurado = () => !!(URL_BASE && TOKEN)

/** Chamada crua no Redis da Upstash: ['GET', chave] → resultado. */
async function redis(comando) {
  const r = await fetch(URL_BASE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(comando),
  })
  if (!r.ok) throw new Error(`Upstash respondeu ${r.status}`)
  const { result } = await r.json()
  return result
}

async function lerAgenda() {
  const bruto = await redis(['GET', CHAVE])
  if (!bruto) return []
  try {
    const lista = JSON.parse(bruto)
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

const gravarAgenda = (lista) => redis(['SET', CHAVE, JSON.stringify(lista)])

/* o painel manda a senha no cabeçalho; sem ela, ninguém lê telefone de
   cliente nem mexe em agendamento alheio */
const autorizado = (req) => (req.headers['x-senha'] || '') === SENHA

const texto = (v, max) => String(v ?? '').trim().slice(0, max)

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (!configurado()) {
    /* 200, não erro: "não tem banco" é um estado previsto, e o cliente usa
       essa resposta para decidir trabalhar offline */
    return res.status(200).json({ configurado: false, agendamentos: [] })
  }

  try {
    /* ---------------------------------------------------- ler a agenda */
    if (req.method === 'GET') {
      /* o site pergunta os horários ocupados sem se identificar; para isso
         basta saber dia, hora e profissional — nada de dado pessoal */
      if (req.query.ocupados !== undefined) {
        const agenda = await lerAgenda()
        return res.status(200).json({
          configurado: true,
          ocupados: agenda
            .filter((a) => a.status !== 'canc')
            .map((a) => ({ data: a.data, hora: a.hora, barb: a.barb })),
        })
      }

      if (!autorizado(req)) return res.status(401).json({ erro: 'Senha inválida' })
      return res.status(200).json({ configurado: true, agendamentos: await lerAgenda() })
    }

    /* ------------------------------------------------ marcar (público) */
    if (req.method === 'POST') {
      const b = req.body || {}

      /* confere a senha aqui também: é assim que o painel faz login */
      if (b.acao === 'entrar') {
        return autorizado(req)
          ? res.status(200).json({ ok: true })
          : res.status(401).json({ erro: 'Senha inválida' })
      }

      const novo = {
        id: Date.now(),
        nome: texto(b.nome, 80),
        tel: texto(b.tel, 30),
        barb: texto(b.barb, 40),
        barbNome: texto(b.barbNome, 60),
        serv: texto(b.serv, 40),
        servNome: texto(b.servNome, 60),
        preco: Number(b.preco) || 0,
        dur: Number(b.dur) || 0,
        data: texto(b.data, 10),
        hora: texto(b.hora, 5),
        obs: texto(b.obs, 300),
        status: 'pend',
        criadoEm: new Date().toISOString(),
      }

      if (!novo.nome || !novo.tel || !novo.serv || !novo.data || !novo.hora)
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' })

      const agenda = await lerAgenda()

      /* a checagem que vale é esta, no servidor: dois celulares podem abrir o
         mesmo horário ao mesmo tempo e só um pode ficar com ele */
      const tomado = agenda.some(
        (a) =>
          a.status !== 'canc' &&
          a.data === novo.data &&
          a.hora === novo.hora &&
          a.barb === novo.barb
      )
      if (tomado)
        return res.status(409).json({ erro: 'Esse horário acabou de ser preenchido. Escolha outro.' })

      await gravarAgenda([...agenda, novo])
      return res.status(201).json({ ok: true, agendamento: novo })
    }

    /* ------------------------------------------------ mexer (só painel) */
    if (!autorizado(req)) return res.status(401).json({ erro: 'Senha inválida' })

    if (req.method === 'PATCH') {
      const { id, status } = req.body || {}
      const agenda = await lerAgenda()
      await gravarAgenda(agenda.map((a) => (a.id === id ? { ...a, status } : a)))
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const { id, tudo } = req.body || {}
      if (tudo) {
        await gravarAgenda([])
        return res.status(200).json({ ok: true })
      }
      const agenda = await lerAgenda()
      await gravarAgenda(agenda.filter((a) => a.id !== id))
      return res.status(200).json({ ok: true })
    }

    /* ------------------------- substituir a agenda inteira (só painel) */
    if (req.method === 'PUT') {
      const { agendamentos } = req.body || {}
      if (!Array.isArray(agendamentos)) return res.status(400).json({ erro: 'Lista inválida' })
      await gravarAgenda(agendamentos)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ erro: 'Método não suportado' })
  } catch (e) {
    return res.status(500).json({ erro: 'Falha ao falar com o banco', detalhe: String(e.message) })
  }
}
