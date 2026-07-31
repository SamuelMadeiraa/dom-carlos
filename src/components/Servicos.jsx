import { motion } from 'framer-motion'
import { useCatalogo } from '../dados/catalogo.js'
import Reveal from './ui/Reveal.jsx'
import { Ilustracao, LinhaCorte } from './ui/Ilustracoes.jsx'

export default function Servicos({ aoEscolher }) {
  const { servicos } = useCatalogo()

  return (
    <section className="secao" id="servicos">
      <div className="container">
        <Reveal className="secao__cabeca">
          <span className="chapeu">Nossos serviços</span>
          <h2>
            O corte certo pro <em>seu estilo</em>
          </h2>
          <p>Preços fechados, sem surpresa na hora de pagar. Clique em agendar e reserve sua cadeira.</p>
        </Reveal>

        <LinhaCorte />

        {/* o span do bento fica no filho direto da grade — quem ocupa a célula
            é o Reveal, não o cartão */}
        <div className="servicos">
          {servicos.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.07} className={s.destaque ? 'servicos__larga' : ''}>
              <motion.article
                className={`servico ${s.destaque ? 'servico--destaque' : ''}`}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                {s.destaque && <span className="servico__selo">Popular</span>}

                <div className="servico__icone">
                  <Ilustracao nome={s.icone} size={40} />
                </div>

                <h3>{s.nome}</h3>
                <p>{s.desc}</p>
                <div className="servico__dur">{s.dur} minutos</div>

                <div className="servico__preco">
                  R${s.preco}
                  <small>,00</small>
                </div>

                <button type="button" className="btn btn--largo" onClick={() => aoEscolher(s.id)}>
                  Agendar este
                </button>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
