import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'
import { CONFIG, gruposExpediente, nomeMarca } from '../config.js'
import { useCatalogo } from '../dados/catalogo.js'
import { FiosCaindo, Tesoura, Maquina, Navalha } from './ui/Ilustracoes.jsx'

const easeOut = [0.16, 1, 0.3, 1]

/* cada linha do título sobe de dentro da sua própria janela */
const subir = {
  oculto: { y: '112%' },
  visivel: (i) => ({
    y: 0,
    transition: { duration: 0.9, delay: 0.12 + i * 0.1, ease: easeOut },
  }),
}

export default function Hero() {
  const area = useRef(null)
  const { servicos, barbeiros } = useCatalogo()

  /* brilho seguindo o mouse: a mola evita o efeito "colado" no cursor */
  const mx = useMotionValue(-400)
  const my = useMotionValue(-400)
  const luzX = useSpring(mx, { stiffness: 90, damping: 22, mass: 0.6 })
  const luzY = useSpring(my, { stiffness: 90, damping: 22, mass: 0.6 })

  const moverLuz = (e) => {
    const r = area.current.getBoundingClientRect()
    mx.set(e.clientX - r.left - 310)
    my.set(e.clientY - r.top - 310)
  }

  /* o cartão de preços sobe um pouco mais devagar que a página (parallax) */
  const { scrollYProgress } = useScroll({ target: area, offset: ['start start', 'end start'] })
  const cartaoY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const conteudoOpacidade = useTransform(scrollYProgress, [0, 0.85], [1, 0.15])

  const abertos = gruposExpediente().filter((g) => g.aberto)

  const numeros = [
    { valor: servicos.length, rotulo: 'serviços no cardápio' },
    { valor: barbeiros.length, rotulo: 'profissionais' },
    CONFIG.cidade
      ? { valor: CONFIG.cidade, rotulo: 'atendimento' }
      : { valor: '24h', rotulo: 'agenda aberta' },
  ]

  return (
    <section className="hero" id="topo" ref={area} onMouseMove={moverLuz}>
      <motion.div className="hero__brilho" style={{ x: luzX, y: luzY }} />
      <FiosCaindo />

      <motion.div className="container hero__grade" style={{ opacity: conteudoOpacidade }}>
        <div>
          <motion.span
            className="pilula"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            <span className="pilula__ponto" />
            <b>Agenda aberta</b> · {CONFIG.tagline}
          </motion.span>

          <h1 className="hero__titulo">
            {CONFIG.titulo.map((linha, i) => (
              <span className="hero__linha" key={linha}>
                <motion.span
                  className={i === CONFIG.tituloDestaque ? 'hero__realce' : ''}
                  custom={i}
                  variants={subir}
                  initial="oculto"
                  animate="visivel"
                >
                  {linha}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="hero__sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: easeOut }}
          >
            {CONFIG.sub}
          </motion.p>

          <motion.div
            className="hero__acoes"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.62, ease: easeOut }}
          >
            <a href="#agendar" className="btn btn--grande">
              Agendar agora
            </a>
            <a href="#servicos" className="btn btn--vazio btn--grande">
              Ver preços
            </a>
          </motion.div>

          <div className="hero__numeros">
            {numeros.map((n, i) => (
              <motion.div
                key={n.rotulo}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.78 + i * 0.08, ease: easeOut }}
              >
                <b>{n.valor}</b>
                <span>{n.rotulo}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.aside
          className="cartao-precos"
          style={{ y: cartaoY }}
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.3, ease: easeOut }}
        >
          {/* o selo sai um pouco pra fora do cartão, como carimbo aplicado */}
          <motion.img
            className="cartao-precos__selo"
            src="/logo-doncarlos.png"
            alt={nomeMarca()}
            initial={{ opacity: 0, scale: 0.7, rotate: -14 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 0.8, delay: 0.85, ease: easeOut }}
          />

          <div className="cartao-precos__ferramentas">
            <Tesoura size={26} />
            <Maquina size={26} />
            <Navalha size={26} />
          </div>

          <div className="cartao-precos__titulo">Tabela de preços</div>

          <ul className="cartao-precos__lista">
            {servicos.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.55 + i * 0.06, ease: easeOut }}
              >
                <div>
                  <div className="n">{s.nome}</div>
                  <div className="d">{s.dur} min</div>
                </div>
                <div className="p">R${s.preco}</div>
              </motion.li>
            ))}
          </ul>

          <div className="cartao-precos__horas">
            {abertos.map((g) => (
              <div key={g.label}>
                <b>{g.label}</b>
                <span>{g.texto}</span>
              </div>
            ))}
          </div>
        </motion.aside>
      </motion.div>
    </section>
  )
}
