import Reveal from './ui/Reveal.jsx'
import { Poste, Pente, Coroa } from './ui/Ilustracoes.jsx'

const ITENS = [
  { Icone: Poste, titulo: 'Agende pelo celular', texto: 'Sem ligação e sem fila de espera' },
  { Icone: Pente, titulo: 'Horário garantido', texto: 'Cada horário fica reservado no seu nome' },
  { Icone: Coroa, titulo: 'Preço fechado', texto: 'Você já sabe quanto vai pagar' },
]

export default function Faixa() {
  return (
    <div className="faixa">
      <div className="container faixa__in">
        {ITENS.map((item, i) => (
          <Reveal key={item.titulo} delay={i * 0.1} className="faixa__item">
            <item.Icone size={34} />
            <div>
              <b>{item.titulo}</b>
              <span>{item.texto}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
