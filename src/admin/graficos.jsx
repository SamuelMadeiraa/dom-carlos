/**
 * Gráficos do painel — SVG puro animado com Framer Motion.
 *
 * Nada de biblioteca de gráfico: são três formatos simples e a dependência
 * custaria mais peso do que o desenho todo. A paleta é a escala de cinza da
 * marca, então os gráficos combinam com o resto do site.
 */
import { motion } from 'framer-motion'
import { TONS } from '../config.js'
import { dinheiro } from '../dados/store.js'

const easeOut = [0.16, 1, 0.3, 1]
const tom = (i) => TONS[i % TONS.length]

/* ------------------------------------------------------- barras verticais */
export function Barras({ dados }) {
  const max = Math.max(...dados.map((d) => d.total), 1)
  const temDado = dados.some((d) => d.total > 0)

  if (!temDado) return <div className="vazio">Sem dados ainda</div>

  return (
    <div className="barras">
      {dados.map((d, i) => {
        const altura = d.total > 0 ? Math.max((d.total / max) * 100, 4) : 0
        return (
          <div className="barra-col" key={d.id}>
            {d.total > 0 && <span className="barra-valor">{dinheiro(d.total)}</span>}
            <motion.div
              className="barra"
              style={{ background: `linear-gradient(180deg, ${tom(i)}, rgba(201,162,39,.14))` }}
              initial={{ height: 0 }}
              animate={{ height: `${altura}%` }}
              transition={{ duration: 0.85, delay: i * 0.06, ease: easeOut }}
            />
            <span className="barra-rotulo">{d.nome.split(' ')[0]}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ rosca */
export function Rosca({ dados }) {
  const usados = dados.filter((d) => d.n > 0)
  const total = usados.reduce((s, d) => s + d.n, 0)

  if (!total) return <div className="vazio">Sem atendimentos</div>

  const r = 52
  const centro = 70
  const circunferencia = 2 * Math.PI * r
  let acumulado = 0

  return (
    <div className="rosca-area">
      <svg width="150" height="150" viewBox="0 0 140 140">
        {usados.map((d, i) => {
          const comprimento = (d.n / total) * circunferencia
          const deslocamento = -acumulado
          acumulado += comprimento

          return (
            <motion.circle
              key={d.id}
              cx={centro}
              cy={centro}
              r={r}
              fill="none"
              stroke={tom(dados.indexOf(d))}
              strokeWidth="22"
              strokeDashoffset={deslocamento}
              transform={`rotate(-90 ${centro} ${centro})`}
              initial={{ strokeDasharray: `0 ${circunferencia}` }}
              animate={{ strokeDasharray: `${comprimento} ${circunferencia - comprimento}` }}
              transition={{ duration: 0.9, delay: i * 0.09, ease: easeOut }}
            />
          )
        })}

        <text x={centro} y={centro - 2} textAnchor="middle" className="rosca-total">
          {total}
        </text>
        <text x={centro} y={centro + 16} textAnchor="middle" className="rosca-sub">
          atendim.
        </text>
      </svg>

      <ul className="legenda">
        {usados.map((d) => (
          <li key={d.id}>
            <span className="legenda__cor" style={{ background: tom(dados.indexOf(d)) }} />
            <span className="legenda__nome">{d.nome}</span>
            <b>
              {d.n} ({Math.round((d.n / total) * 100)}%)
            </b>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* --------------------------------------------------- ranking horizontal */
export function Ranking({ dados }) {
  const max = Math.max(...dados.map((d) => d.total), 1)
  if (!dados.some((d) => d.total > 0)) return <div className="vazio">Sem atendimentos</div>

  return (
    <div className="ranking">
      {dados.map((d, i) => (
        <div className="ranking__linha" key={d.id}>
          <div className="ranking__nome">
            {d.nome}
            <small>{d.n} atend.</small>
          </div>
          <div className="ranking__trilho">
            <motion.i
              initial={{ width: 0 }}
              animate={{ width: `${(d.total / max) * 100}%` }}
              transition={{ duration: 0.85, delay: i * 0.08, ease: easeOut }}
            />
          </div>
          <div className="ranking__valor">{dinheiro(d.total)}</div>
        </div>
      ))}
    </div>
  )
}
