import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONFIG, STATUS, nomeMarca } from '../config.js'
import { Link } from '../router.jsx'
import { useCatalogo } from '../dados/catalogo.js'
import {
  listar, aoMudar, resumo, receitaPorServico, receitaPorBarbeiro, agendaDeHoje,
  mudarStatus, excluir, limparTudo, exportarCsv, gerarExemplos, dinheiro, hojeISO, linkWhatsapp,
} from '../dados/store.js'
import { Barras, Rosca, Ranking } from './graficos.jsx'
import Catalogo from './Catalogo.jsx'
import { Poste } from '../components/ui/Ilustracoes.jsx'

const easeOut = [0.16, 1, 0.3, 1]

export default function Painel({ aoSair }) {
  /* um contador simples é o bastante pra reprocessar tudo quando os dados mudam */
  const [versao, setVersao] = useState(0)
  /* o catálogo entra aqui porque os gráficos são por serviço e por
     profissional: mudou o cardápio, os números têm que ser refeitos */
  const catalogo = useCatalogo()
  const [busca, setBusca] = useState('')
  const [filtroBarb, setFiltroBarb] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [recado, setRecado] = useState('')

  useEffect(() => aoMudar(() => setVersao((v) => v + 1)), [])

  useEffect(() => {
    if (!recado) return
    const t = setTimeout(() => setRecado(''), 3000)
    return () => clearTimeout(t)
  }, [recado])

  const dados = useMemo(
    () => ({
      kpis: resumo(),
      servicos: receitaPorServico(),
      barbeiros: receitaPorBarbeiro(),
      hoje: agendaDeHoje(),
      todos: listar(),
    }),
    [versao, catalogo]
  )

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return dados.todos
      .filter(
        (a) =>
          (!filtroStatus || a.status === filtroStatus) &&
          (!filtroBarb || a.barb === filtroBarb) &&
          (!termo || a.nome.toLowerCase().includes(termo) || a.tel.toLowerCase().includes(termo))
      )
      .sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora))
  }, [dados.todos, busca, filtroBarb, filtroStatus])

  const cartoes = [
    { titulo: 'Agendamentos', valor: dados.kpis.total, pe: 'total registrado' },
    { titulo: 'Receita estimada', valor: dinheiro(dados.kpis.receita), pe: `${dados.kpis.ativos} atendimentos ativos` },
    { titulo: 'Para hoje', valor: dados.kpis.hoje, pe: 'na agenda do dia' },
    { titulo: 'Pendentes', valor: dados.kpis.pendentes, pe: 'aguardando confirmação' },
    { titulo: 'Ticket médio', valor: dinheiro(dados.kpis.ticket), pe: 'por atendimento' },
  ]

  return (
    <div className="painel">
      <header className="painel__topo">
        <div className="container painel__topo-in">
          <div className="marca">
            <Poste size={28} />
            <span>
              <span className="marca__l1">
                {CONFIG.marca.parte1} <em>{CONFIG.marca.parte2}</em>
              </span>
              <span className="marca__l2">Painel administrativo</span>
            </span>
          </div>

          <div className="painel__acoes">
            <button
              className="btn btn--vazio btn--pequeno"
              onClick={() => {
                gerarExemplos()
                setRecado('Dados de exemplo gerados')
              }}
            >
              Dados de exemplo
            </button>
            <button
              className="btn btn--vazio btn--pequeno"
              onClick={() => setRecado(exportarCsv() ? 'CSV exportado' : 'Nada para exportar')}
            >
              Exportar
            </button>
            <Link para="/" className="btn btn--vazio btn--pequeno">
              Ver site
            </Link>
            <button className="btn btn--fantasma btn--pequeno" onClick={aoSair}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container painel__corpo">
        <h1>Visão geral</h1>
        <p className="painel__sub">Acompanhe a agenda e o faturamento da barbearia.</p>

        <div className="kpis">
          {cartoes.map((c, i) => (
            <motion.div
              className="kpi"
              key={c.titulo}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: easeOut }}
            >
              <span className="kpi__titulo">{c.titulo}</span>
              <motion.strong
                key={String(c.valor)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {c.valor}
              </motion.strong>
              <span className="kpi__pe">{c.pe}</span>
            </motion.div>
          ))}
        </div>

        <div className="painel__grade">
          <section className="quadro">
            <h3>Faturamento por serviço</h3>
            <span className="quadro__sub">Receita estimada, ignorando cancelados</span>
            <Barras dados={dados.servicos} />
          </section>

          <section className="quadro">
            <h3>Distribuição</h3>
            <span className="quadro__sub">Atendimentos por serviço</span>
            <Rosca dados={dados.servicos} />
          </section>
        </div>

        <div className="painel__grade">
          <section className="quadro">
            <h3>Desempenho por profissional</h3>
            <span className="quadro__sub">Receita gerada por cada um</span>
            <Ranking dados={dados.barbeiros} />
          </section>

          <section className="quadro">
            <h3>Agenda de hoje</h3>
            <span className="quadro__sub">
              {new Date(hojeISO() + 'T00:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
              })}
            </span>

            <div className="agenda">
              {!dados.hoje.length && <div className="vazio">Nenhum horário marcado para hoje</div>}

              <AnimatePresence initial={false}>
                {dados.hoje.map((a) => (
                  <motion.div
                    className="agenda__item"
                    key={a.id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                  >
                    <span className="agenda__hora">{a.hora}</span>
                    <span className="agenda__quem">
                      <b>{a.nome}</b>
                      <small>
                        {a.servNome} · {a.barbNome}
                      </small>
                    </span>
                    <span className={`etiqueta-status ${STATUS[a.status].cls}`}>
                      {STATUS[a.status].lbl}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        <Catalogo aoAvisar={setRecado} />

        <section className="quadro">
          <div className="quadro__cabeca">
            <div>
              <h3>Agendamentos</h3>
              <span className="quadro__sub">{filtrados.length} agendamento(s)</span>
            </div>

            <div className="filtros">
              <input
                type="search"
                placeholder="Buscar nome ou telefone…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <select value={filtroBarb} onChange={(e) => setFiltroBarb(e.target.value)}>
                <option value="">Todos os profissionais</option>
                {catalogo.barbeiros.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nome}
                  </option>
                ))}
              </select>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                <option value="">Todos os status</option>
                {Object.entries(STATUS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.lbl}
                  </option>
                ))}
              </select>
              <button
                className="btn btn--vazio btn--pequeno"
                onClick={() => {
                  if (!listar().length) return setRecado('Já está vazio')
                  if (confirm('Isso vai apagar TODOS os agendamentos. Continuar?')) {
                    limparTudo()
                    setRecado('Tudo limpo')
                  }
                }}
              >
                Limpar tudo
              </button>
            </div>
          </div>

          <div className="tabela-area">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Profissional</th>
                  <th>Serviço</th>
                  <th>Data / Hora</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtrados.map((a) => (
                    <motion.tr key={a.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td>
                        <b>{a.nome}</b>
                        <small>{a.tel}</small>
                      </td>
                      <td>{a.barbNome}</td>
                      <td>
                        {a.servNome}
                        {a.obs && <small>{a.obs}</small>}
                      </td>
                      <td>
                        {new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                        <b>{a.hora}</b>
                      </td>
                      <td>
                        <b>{dinheiro(a.preco)}</b>
                      </td>
                      <td>
                        <select
                          className={`etiqueta-status ${STATUS[a.status].cls}`}
                          value={a.status}
                          onChange={(e) => mudarStatus(a.id, e.target.value)}
                        >
                          {Object.entries(STATUS).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.lbl}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="acoes-linha">
                          <a
                            className="botao-icone"
                            title="Abrir no WhatsApp"
                            href={linkWhatsapp(a, nomeMarca())}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            zap
                          </a>
                          <button
                            className="botao-icone"
                            title="Excluir"
                            onClick={() => confirm('Excluir este agendamento?') && excluir(a.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {!filtrados.length && <div className="vazio">Nenhum agendamento encontrado</div>}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {recado && (
          <motion.div
            className="recado"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            {recado}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
