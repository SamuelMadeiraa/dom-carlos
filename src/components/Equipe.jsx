import { motion } from 'framer-motion'
import { BARBEIROS } from '../config.js'
import Reveal from './ui/Reveal.jsx'
import { Tesoura, Maquina, Navalha } from './ui/Ilustracoes.jsx'

/* cada profissional ganha a ferramenta da sua especialidade */
const FERRAMENTAS = [Tesoura, Maquina, Navalha]

export default function Equipe() {
  return (
    <section className="secao secao--alt" id="equipe">
      <div className="container">
        <Reveal className="secao__cabeca">
          <span className="chapeu">Quem cuida de você</span>
          <h2>
            A <em>equipe</em>
          </h2>
          <p>Escolha o profissional na hora de agendar — ou deixe com quem estiver livre.</p>
        </Reveal>

        <div className="equipe">
          {BARBEIROS.map((b, i) => {
            const Ferramenta = FERRAMENTAS[i % FERRAMENTAS.length]
            const inicial = b.nome.trim().split(' ').pop()[0]

            return (
              <Reveal key={b.id} delay={i * 0.1}>
                <motion.article
                  className="profissional"
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                >
                  <div className="profissional__avatar">
                    <span>{inicial}</span>
                    <motion.div
                      className="profissional__anel"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>

                  <h4>{b.nome}</h4>
                  <div className="profissional__esp">
                    <Ferramenta size={18} />
                    {b.esp}
                  </div>
                  <p>{b.bio}</p>
                </motion.article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
