import { motion } from 'framer-motion'
import { CONFIG, mapaEmbed, mapaLink, nomeMarca } from '../config.js'
import { Poste } from './ui/Ilustracoes.jsx'
import Reveal from './ui/Reveal.jsx'

/**
 * Fecha a página com o endereço e o mapa do Google.
 *
 * Sem `enderecoMapa` no config a seção inteira some — outro cliente que
 * atenda só a domicílio não precisa apagar nada.
 */
export default function Mapa() {
  if (!CONFIG.enderecoMapa) return null

  return (
    <section className="mapa" id="onde">
      <div className="container mapa__grade">
        <Reveal className="mapa__lado">
          <span className="chapeu">Onde ficamos</span>

          <h2>
            A cadeira te espera <em>aqui</em>.
          </h2>

          <p className="mapa__endereco">
            <strong>{CONFIG.endereco}</strong>
            {CONFIG.bairro}
          </p>

          <div className="info">
            <div className="info__icone">
              <Poste size={22} />
            </div>
            <div>
              <b>Cidade</b>
              <span>{CONFIG.cidade}</span>
            </div>
          </div>

          <div className="mapa__acoes">
            <a href={mapaLink} target="_blank" rel="noopener noreferrer" className="btn">
              Traçar rota no Maps
            </a>
            <a href="#agendar" className="btn btn--vazio">
              Agendar horário
            </a>
          </div>
        </Reveal>

        <motion.div
          className="mapa__quadro"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <iframe
            src={mapaEmbed}
            title={`Mapa — ${nomeMarca()}`}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </div>
    </section>
  )
}
