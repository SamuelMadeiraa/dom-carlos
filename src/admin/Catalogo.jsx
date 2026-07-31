/**
 * Edição do cardápio e da equipe pelo painel.
 *
 * Trabalha sobre um rascunho em memória: nada vai para o site enquanto o dono
 * não clicar em salvar. Assim ele pode mexer à vontade, e um campo apagado no
 * meio da digitação não deixa o site fora do ar.
 */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  servicos as servicosAtuais,
  barbeiros as barbeirosAtuais,
  salvarCatalogo,
  restaurarPadrao,
  temEdicao,
  novoId,
} from '../dados/catalogo.js'
import { Ilustracao } from '../components/ui/Ilustracoes.jsx'

const ICONES = [
  { valor: 'tesoura', rotulo: 'Tesoura' },
  { valor: 'navalha', rotulo: 'Navalha' },
  { valor: 'maquina', rotulo: 'Máquina' },
  { valor: 'pente', rotulo: 'Pente' },
  { valor: 'poste', rotulo: 'Poste' },
  { valor: 'coroa', rotulo: 'Coroa' },
]

/* cópia rasa das listas: editar o rascunho não pode mexer no que está salvo */
const clonar = (lista) => lista.map((item) => ({ ...item }))

export default function Catalogo({ aoAvisar }) {
  const [servicos, setServicos] = useState(() => clonar(servicosAtuais()))
  const [barbeiros, setBarbeiros] = useState(() => clonar(barbeirosAtuais()))
  const [sujo, setSujo] = useState(false)

  const mexer = (setLista) => (indice, chave, valor) => {
    setLista((lista) => lista.map((item, i) => (i === indice ? { ...item, [chave]: valor } : item)))
    setSujo(true)
  }
  const mexerServico = mexer(setServicos)
  const mexerBarbeiro = mexer(setBarbeiros)

  const remover = (setLista, indice) => {
    setLista((lista) => lista.filter((_, i) => i !== indice))
    setSujo(true)
  }

  const addServico = () => {
    setServicos((lista) => [
      ...lista,
      {
        id: novoId('servico', lista.map((s) => s.id)),
        nome: 'Novo serviço',
        preco: 0,
        dur: 30,
        desc: '',
        icone: 'tesoura',
      },
    ])
    setSujo(true)
  }

  const addBarbeiro = () => {
    setBarbeiros((lista) => [
      ...lista,
      {
        id: novoId('profissional', lista.map((b) => b.id)),
        nome: 'Novo profissional',
        esp: '',
        bio: '',
      },
    ])
    setSujo(true)
  }

  /* só um serviço pode ser o destaque: marcar um desmarca o anterior */
  const marcarDestaque = (indice) => {
    setServicos((lista) =>
      lista.map((s, i) => ({ ...s, destaque: i === indice ? !s.destaque : false }))
    )
    setSujo(true)
  }

  const salvar = () => {
    const limpos = servicos
      .map((s) => ({ ...s, nome: s.nome.trim(), preco: Number(s.preco) || 0, dur: Number(s.dur) || 0 }))
      .filter((s) => s.nome)
    const equipe = barbeiros.map((b) => ({ ...b, nome: b.nome.trim() })).filter((b) => b.nome)

    if (!limpos.length || !equipe.length) {
      aoAvisar('Deixe ao menos um serviço e um profissional com nome')
      return
    }

    salvarCatalogo({ servicos: limpos, barbeiros: equipe })
    setServicos(clonar(limpos))
    setBarbeiros(clonar(equipe))
    setSujo(false)
    aoAvisar('Cardápio atualizado no site')
  }

  const restaurar = () => {
    if (!confirm('Isso descarta suas alterações e volta ao cardápio original. Continuar?')) return
    restaurarPadrao()
    setServicos(clonar(servicosAtuais()))
    setBarbeiros(clonar(barbeirosAtuais()))
    setSujo(false)
    aoAvisar('Cardápio original restaurado')
  }

  return (
    <section className="quadro">
      <div className="quadro__cabeca">
        <div>
          <h3>Serviços e equipe</h3>
          <span className="quadro__sub">
            O que você salvar aqui aparece no site na hora. Agendamentos já feitos guardam o preço
            da época e não mudam.
          </span>
        </div>

        <div className="filtros">
          {temEdicao() && (
            <button className="btn btn--vazio btn--pequeno" onClick={restaurar}>
              Restaurar original
            </button>
          )}
          <button className="btn btn--pequeno" onClick={salvar} disabled={!sujo}>
            {sujo ? 'Salvar alterações' : 'Tudo salvo'}
          </button>
        </div>
      </div>

      <div className="editor">
        <div className="editor__coluna">
          <h4 className="editor__titulo">Serviços</h4>

          <AnimatePresence initial={false}>
            {servicos.map((s, i) => (
              <motion.div
                className="editor__item"
                key={s.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 14 }}
              >
                <div className="editor__icone">
                  <Ilustracao nome={s.icone} size={26} animar={false} />
                </div>

                <div className="editor__campos">
                  <input
                    className="editor__nome"
                    value={s.nome}
                    placeholder="Nome do serviço"
                    onChange={(e) => mexerServico(i, 'nome', e.target.value)}
                  />

                  <div className="editor__linha">
                    <label className="editor__mini">
                      <span>Preço R$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={s.preco}
                        onChange={(e) => mexerServico(i, 'preco', e.target.value)}
                      />
                    </label>

                    <label className="editor__mini">
                      <span>Duração min</span>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={s.dur}
                        onChange={(e) => mexerServico(i, 'dur', e.target.value)}
                      />
                    </label>

                    <label className="editor__mini">
                      <span>Ícone</span>
                      <select
                        value={s.icone || 'tesoura'}
                        onChange={(e) => mexerServico(i, 'icone', e.target.value)}
                      >
                        {ICONES.map((o) => (
                          <option key={o.valor} value={o.valor}>
                            {o.rotulo}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <textarea
                    rows="2"
                    value={s.desc || ''}
                    placeholder="Descrição que aparece no card"
                    onChange={(e) => mexerServico(i, 'desc', e.target.value)}
                  />

                  <label className="editor__marca">
                    <input
                      type="checkbox"
                      checked={!!s.destaque}
                      onChange={() => marcarDestaque(i)}
                    />
                    Destacar como o combo da casa
                  </label>
                </div>

                <button
                  className="botao-icone"
                  title="Remover serviço"
                  onClick={() => remover(setServicos, i)}
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <button className="btn btn--vazio btn--pequeno btn--largo" onClick={addServico}>
            + Adicionar serviço
          </button>
        </div>

        <div className="editor__coluna">
          <h4 className="editor__titulo">Profissionais</h4>

          <AnimatePresence initial={false}>
            {barbeiros.map((b, i) => (
              <motion.div
                className="editor__item"
                key={b.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 14 }}
              >
                <div className="editor__icone">{b.nome.trim().slice(0, 1).toUpperCase() || '·'}</div>

                <div className="editor__campos">
                  <input
                    className="editor__nome"
                    value={b.nome}
                    placeholder="Nome do profissional"
                    onChange={(e) => mexerBarbeiro(i, 'nome', e.target.value)}
                  />
                  <input
                    value={b.esp || ''}
                    placeholder="Especialidade (ex.: degradê & navalha)"
                    onChange={(e) => mexerBarbeiro(i, 'esp', e.target.value)}
                  />
                  <textarea
                    rows="2"
                    value={b.bio || ''}
                    placeholder="Uma linha sobre ele, para o card da equipe"
                    onChange={(e) => mexerBarbeiro(i, 'bio', e.target.value)}
                  />
                </div>

                <button
                  className="botao-icone"
                  title="Remover profissional"
                  onClick={() => remover(setBarbeiros, i)}
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <button className="btn btn--vazio btn--pequeno btn--largo" onClick={addBarbeiro}>
            + Adicionar profissional
          </button>
        </div>
      </div>
    </section>
  )
}
