import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONFIG, gruposExpediente, nomeMarca } from '../config.js'
import { useCatalogo, servicoPor, barbeiroPor } from '../dados/catalogo.js'
import { agendar, horariosDoDia, hojeISO, linkWhatsapp, dinheiro, aoMudar } from '../dados/store.js'
import Reveal from './ui/Reveal.jsx'
import { Poste, Pente, Navalha, Coroa, Tesoura } from './ui/Ilustracoes.jsx'

const VAZIO = { nome: '', tel: '', serv: '', barb: '', data: '', hora: '', obs: '' }

export default function Agendamento({ servicoPreSelecionado }) {
  const { servicos, barbeiros } = useCatalogo()
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState('')
  const [feito, setFeito] = useState(null)
  /* trava o botão enquanto o servidor responde: sem isso, dois cliques
     rápidos viram duas reservas */
  const [enviando, setEnviando] = useState(false)
  /* a grade de horários vem da agenda compartilhada, que chega depois do
     primeiro render — este contador redesenha quando ela aterrissa */
  const [versaoAgenda, setVersaoAgenda] = useState(0)

  useEffect(() => aoMudar(() => setVersaoAgenda((v) => v + 1)), [])

  const campo = (chave) => (e) => {
    setForm((f) => ({ ...f, [chave]: e.target.value }))
    setErro('')
  }

  /* clicar em "agendar este" lá nos cards já traz o serviço escolhido */
  useEffect(() => {
    if (servicoPreSelecionado) {
      setForm((f) => ({ ...f, serv: servicoPreSelecionado }))
      setFeito(null)
    }
  }, [servicoPreSelecionado])

  /* trocar de dia ou de profissional invalida o horário que estava marcado */
  useEffect(() => {
    setForm((f) => ({ ...f, hora: '' }))
  }, [form.data, form.barb])

  const horarios = useMemo(
    () => horariosDoDia(form.data, form.barb),
    // feito entra na lista porque, depois de agendar, um horário some da grade
    [form.data, form.barb, feito, versaoAgenda]
  )

  const servico = servicoPor(form.serv)
  const fechados = gruposExpediente().filter((g) => !g.aberto)
  const enderecoCompleto = [CONFIG.endereco, CONFIG.bairro].filter(Boolean)

  const enviar = async (e) => {
    e.preventDefault()
    if (enviando) return

    setEnviando(true)
    const r = await agendar(form)
    setEnviando(false)

    if (!r.ok) {
      setErro(r.erro)
      return
    }
    setFeito(r.agendamento)
    setForm(VAZIO)
    setErro('')
  }

  const contatos = [
    enderecoCompleto.length && { Icone: Poste, titulo: 'Endereço', linhas: enderecoCompleto },
    { Icone: Pente, titulo: 'Horário', linhas: gruposExpediente().map((g) => `${g.label}: ${g.texto}`) },
    { Icone: Navalha, titulo: 'WhatsApp', linhas: [CONFIG.whatsappExibicao] },
    { Icone: Coroa, titulo: 'Pagamento', linhas: [CONFIG.pagamento] },
    {
      Icone: Tesoura,
      titulo: 'Atrasos',
      linhas: [`Tolerância de ${CONFIG.toleranciaMin} minutos.`, 'Depois disso o horário pode ser remarcado.'],
    },
  ].filter(Boolean)

  return (
    <section className="secao" id="agendar">
      <div className="container">
        <Reveal className="secao__cabeca">
          <span className="chapeu">Agende seu horário</span>
          <h2>
            Reserve em <em>1 minuto</em>
          </h2>
          <p>Preencha os dados abaixo. Depois de confirmar, você pode mandar tudo pelo WhatsApp.</p>
        </Reveal>

        <div className="agendar">
          <Reveal className="agendar__info">
            <h3>Cadeira reservada</h3>
            <div className="regua regua--clara" />

            {contatos.map((c) => (
              <div className="info" key={c.titulo}>
                <div className="info__icone">
                  <c.Icone size={22} animar={false} />
                </div>
                <div>
                  <b>{c.titulo}</b>
                  {c.linhas.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </div>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.12}>
            <form className="formulario" onSubmit={enviar} autoComplete="off">
              <AnimatePresence mode="wait">
                {feito && (
                  <motion.div
                    key="ok"
                    className="aviso aviso--ok"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <b>Horário reservado!</b>{' '}
                    {feito.servNome} com {feito.barbNome},{' '}
                    {new Date(feito.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                    })}{' '}
                    às {feito.hora}. Confirmamos pelo WhatsApp.
                    <a
                      className="btn btn--pequeno"
                      href={linkWhatsapp(feito, nomeMarca())}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Enviar pelo WhatsApp
                    </a>
                  </motion.div>
                )}

                {erro && (
                  <motion.div
                    key="erro"
                    className="aviso aviso--erro"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {erro}
                  </motion.div>
                )}
              </AnimatePresence>

              <label className="campo">
                <span>Nome completo *</span>
                <input type="text" value={form.nome} onChange={campo('nome')} placeholder="Seu nome" />
              </label>

              <div className="campo__dupla">
                <label className="campo">
                  <span>WhatsApp *</span>
                  <input type="tel" value={form.tel} onChange={campo('tel')} placeholder="(00) 90000-0000" />
                </label>

                <label className="campo">
                  <span>Profissional</span>
                  <select value={form.barb} onChange={campo('barb')}>
                    <option value="">Qualquer um disponível</option>
                    {barbeiros.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nome} — {b.esp}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="campo">
                <span>Serviço *</span>
                <select value={form.serv} onChange={campo('serv')}>
                  <option value="">Selecione um serviço</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} — R${s.preco},00 ({s.dur}min)
                    </option>
                  ))}
                </select>
              </label>

              <label className="campo">
                <span>Data *</span>
                <input type="date" value={form.data} min={hojeISO()} onChange={campo('data')} />
                {!!fechados.length && (
                  <small>Fechado: {fechados.map((g) => g.label.toLowerCase()).join(', ')}.</small>
                )}
              </label>

              {/* grade de horários: mais rápida de escolher no celular que um menu */}
              <div className="campo">
                <span>Horário *</span>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={form.data + form.barb}
                    className="horarios"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {!form.data && <p className="horarios__vazio">Escolha a data primeiro.</p>}

                    {form.data && !horarios.length && (
                      <p className="horarios__vazio">Fechado neste dia. Escolha outra data.</p>
                    )}

                    {horarios.map((h) => (
                      <button
                        key={h.hora}
                        type="button"
                        disabled={!h.livre}
                        className={`horario ${form.hora === h.hora ? 'horario--ativo' : ''}`}
                        onClick={() => {
                          setForm((f) => ({ ...f, hora: h.hora }))
                          setErro('')
                        }}
                      >
                        {h.hora}
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              <label className="campo">
                <span>Observações</span>
                <textarea
                  rows="2"
                  value={form.obs}
                  onChange={campo('obs')}
                  placeholder="Alguma preferência de corte? (opcional)"
                />
              </label>

              <div className="resumo">
                <div>
                  <span className="resumo__rotulo">Resumo</span>
                  <div className="resumo__texto">
                    {servico
                      ? `${servico.nome} · ${servico.dur}min${
                          barbeiroPor(form.barb) ? ` · ${barbeiroPor(form.barb).nome}` : ''
                        }${form.hora ? ` · ${form.hora}` : ''}`
                      : 'Selecione um serviço'}
                  </div>
                </div>
                <motion.div
                  key={servico?.id || 'vazio'}
                  className="resumo__valor"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                >
                  {servico ? dinheiro(servico.preco) : '—'}
                </motion.div>
              </div>

              <motion.button
                type="submit"
                className="btn btn--largo btn--grande"
                disabled={enviando}
                whileHover={enviando ? {} : { scale: 1.015 }}
                whileTap={enviando ? {} : { scale: 0.985 }}
              >
                {enviando ? 'Reservando…' : 'Confirmar agendamento'}
              </motion.button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
