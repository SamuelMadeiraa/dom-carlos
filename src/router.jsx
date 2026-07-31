/**
 * Roteador mínimo — só existem duas telas (site e /admin), então não vale
 * trazer uma biblioteca de rotas. `Link` continua sendo um <a href> de
 * verdade: Ctrl+clique e botão do meio seguem abrindo em nova aba.
 */
import { useEffect, useState } from 'react'

const rotaAtual = () => window.location.pathname

export function navegar(para) {
  window.history.pushState({}, '', para)
  window.dispatchEvent(new Event('rota'))
  requestAnimationFrame(() => window.scrollTo(0, 0))
}

export function useRota() {
  const [rota, setRota] = useState(rotaAtual)

  useEffect(() => {
    const aoMudar = () => setRota(rotaAtual())
    window.addEventListener('popstate', aoMudar)
    window.addEventListener('rota', aoMudar)
    return () => {
      window.removeEventListener('popstate', aoMudar)
      window.removeEventListener('rota', aoMudar)
    }
  }, [])

  return rota
}

export function Link({ para, children, ...rest }) {
  const clicar = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navegar(para)
  }
  return (
    <a href={para} onClick={clicar} {...rest}>
      {children}
    </a>
  )
}
