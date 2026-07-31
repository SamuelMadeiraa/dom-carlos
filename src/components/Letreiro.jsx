import { motion } from 'framer-motion'
import { Tesoura, Maquina, Navalha, Pente, Poste, Coroa } from './ui/Ilustracoes.jsx'

const PALAVRAS = [
  ['Corte na régua', Tesoura],
  ['Barba terapia', Navalha],
  ['Degradê', Maquina],
  ['Hora marcada', Pente],
  ['Sem fila', Poste],
  ['Acabamento', Coroa],
]

/**
 * Letreiro infinito entre o hero e o conteúdo.
 *
 * O truque é duplicar a lista e animar até -50%: quando a primeira cópia sai
 * de cena, a segunda já está exatamente no lugar dela, então o laço não tem
 * emenda visível.
 */
export default function Letreiro() {
  const bloco = (
    <div className="letreiro__item">
      {PALAVRAS.map(([texto, Icone]) => (
        <span key={texto} className="letreiro__par">
          <span>{texto}</span>
          <Icone size={22} />
        </span>
      ))}
    </div>
  )

  return (
    <div className="letreiro" aria-hidden="true">
      <motion.div
        className="letreiro__trilho"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
      >
        {bloco}
        {bloco}
      </motion.div>
    </div>
  )
}
