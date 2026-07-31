import { useState } from 'react'
import { motion } from 'framer-motion'
import { CONFIG } from '../config.js'
import { Link } from '../router.jsx'
import { Poste, Tesoura } from '../components/ui/Ilustracoes.jsx'

export default function Login({ aoEntrar }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(false)

  const enviar = (e) => {
    e.preventDefault()
    if (senha === CONFIG.senhaAdmin) aoEntrar()
    else setErro(true)
  }

  return (
    <div className="login">
      <motion.div
        className="login__cartao"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        /* o "não" da senha errada: o cartão treme igual porta que não abriu */
        {...(erro ? { animate: { x: [0, -9, 9, -5, 0], opacity: 1, y: 0, scale: 1 } } : {})}
      >
        <div className="login__marca">
          <Poste size={38} />
          <span className="marca__l1">
            {CONFIG.marca.parte1} <em>{CONFIG.marca.parte2}</em>
          </span>
        </div>

        <h2>Painel do administrador</h2>
        <p>Acesse para gerenciar a agenda</p>

        <form onSubmit={enviar}>
          {erro && <div className="aviso aviso--erro">Senha incorreta.</div>}

          <label className="campo">
            <span>Senha</span>
            <input
              type="password"
              value={senha}
              autoFocus
              placeholder="Digite a senha"
              onChange={(e) => {
                setSenha(e.target.value)
                setErro(false)
              }}
            />
            <small>
              {CONFIG.mostrarSenhaNaTela ? (
                <>
                  Senha padrão: <b>{CONFIG.senhaAdmin}</b>
                </>
              ) : (
                'Acesso restrito à administração.'
              )}
            </small>
          </label>

          <button type="submit" className="btn btn--largo btn--grande">
            Entrar
          </button>

          <Link para="/" className="login__voltar">
            <Tesoura size={16} animar={false} /> Voltar ao site
          </Link>
        </form>
      </motion.div>
    </div>
  )
}
