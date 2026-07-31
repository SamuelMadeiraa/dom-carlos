import { useEffect, useState } from 'react'
import { CONFIG } from '../config.js'
import Login from './Login.jsx'
import Painel from './Painel.jsx'
import './admin.css'

const CHAVE_SESSAO = CONFIG.chaveArmazenamento + '-auth'

export default function AdminApp() {
  /* sessionStorage: fecha a aba, precisa entrar de novo */
  const [logado, setLogado] = useState(() => sessionStorage.getItem(CHAVE_SESSAO) === '1')

  useEffect(() => {
    document.body.classList.add('modo-admin')
    return () => document.body.classList.remove('modo-admin')
  }, [])

  const entrar = () => {
    sessionStorage.setItem(CHAVE_SESSAO, '1')
    setLogado(true)
  }

  const sair = () => {
    sessionStorage.removeItem(CHAVE_SESSAO)
    setLogado(false)
  }

  return logado ? <Painel aoSair={sair} /> : <Login aoEntrar={entrar} />
}
