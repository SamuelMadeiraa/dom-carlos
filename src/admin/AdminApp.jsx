import { useEffect, useState } from 'react'
import { CONFIG } from '../config.js'
import { guardarSenha, disponivel as naNuvem, verificar } from '../dados/nuvem.js'
import { recarregarAgenda } from '../dados/store.js'
import Login from './Login.jsx'
import Painel from './Painel.jsx'
import './admin.css'

const CHAVE_SESSAO = CONFIG.chaveArmazenamento + '-auth'

export default function AdminApp() {
  /* sessionStorage: fecha a aba, precisa entrar de novo. Guarda a senha junto
     porque, no modo nuvem, cada chamada ao servidor precisa dela — e a senha
     nunca sai da aba (nada de localStorage). */
  const [logado, setLogado] = useState(false)
  const [conferindo, setConferindo] = useState(true)

  useEffect(() => {
    document.body.classList.add('modo-admin')
    return () => document.body.classList.remove('modo-admin')
  }, [])

  /* retoma a sessão da aba: valida de novo contra o servidor antes de abrir */
  useEffect(() => {
    let vivo = true

    ;(async () => {
      const salva = sessionStorage.getItem(CHAVE_SESSAO)
      if (!salva) return vivo && setConferindo(false)

      await verificar()
      guardarSenha(salva)
      try {
        /* sem nuvem não há quem validar do outro lado: confere aqui mesmo */
        if (naNuvem()) await recarregarAgenda()
        else if (salva !== CONFIG.senhaAdmin) throw new Error('senha antiga')
        if (vivo) setLogado(true)
      } catch {
        sessionStorage.removeItem(CHAVE_SESSAO)
        guardarSenha('')
      }
      if (vivo) setConferindo(false)
    })()

    return () => {
      vivo = false
    }
  }, [])

  const entrar = async (senha) => {
    sessionStorage.setItem(CHAVE_SESSAO, senha)
    guardarSenha(senha)
    if (naNuvem()) await recarregarAgenda()
    setLogado(true)
  }

  const sair = () => {
    sessionStorage.removeItem(CHAVE_SESSAO)
    guardarSenha('')
    setLogado(false)
  }

  if (conferindo) return <div className="carregando">Abrindo painel…</div>

  return logado ? <Painel aoSair={sair} /> : <Login aoEntrar={entrar} />
}
