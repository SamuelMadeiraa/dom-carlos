import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CONFIG, nomeMarca } from '../config.js'

const LINKS = [
  { href: '#servicos', texto: 'Serviços' },
  { href: '#equipe', texto: 'Equipe' },
  { href: '#agendar', texto: 'Agendar' },
  { href: '#onde', texto: 'Onde' },
]

export default function Nav() {
  /* a barra ganha fundo sólido depois que a pessoa rola — em cima do hero ela
     fica transparente pra não cortar a imagem */
  const [rolou, setRolou] = useState(false)

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 40)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  return (
    <motion.header
      className={`nav ${rolou ? 'nav--solida' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container nav__in">
        <a className="marca" href="#topo">
          <img className="marca__logo" src="/logo-doncarlos.png" alt={nomeMarca()} />
          <span>
            <span className="marca__l1">
              {CONFIG.marca.parte1} <em>{CONFIG.marca.parte2}</em>
            </span>
            <span className="marca__l2">{CONFIG.marca.sub}</span>
          </span>
        </a>

        <nav className="nav__links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.texto}
            </a>
          ))}
          <a href="#agendar" className="btn">
            Agendar horário
          </a>
        </nav>
      </div>
    </motion.header>
  )
}
