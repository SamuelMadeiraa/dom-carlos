import { lazy, Suspense, useState } from 'react'
import { useRota } from './router.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Letreiro from './components/Letreiro.jsx'
import Faixa from './components/Faixa.jsx'
import Servicos from './components/Servicos.jsx'
import Equipe from './components/Equipe.jsx'
import Agendamento from './components/Agendamento.jsx'
import Mapa from './components/Mapa.jsx'
import Footer from './components/Footer.jsx'

/* o painel só é baixado por quem abre /admin — o cliente não carrega esse peso */
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

export default function App() {
  const rota = useRota()

  /* guarda qual serviço veio dos cards; o contador força o efeito a rodar de
     novo mesmo quando a pessoa clica duas vezes no mesmo serviço */
  const [escolha, setEscolha] = useState({ id: '', n: 0 })

  if (/^\/(admin|painel)/.test(rota)) {
    return (
      <Suspense fallback={<div className="carregando">Carregando painel…</div>}>
        <AdminApp />
      </Suspense>
    )
  }

  const escolher = (id) => {
    setEscolha((e) => ({ id, n: e.n + 1 }))
    document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Letreiro />
        <Faixa />
        <Servicos aoEscolher={escolher} />
        <Equipe />
        <Agendamento servicoPreSelecionado={escolha.id} key={`serv-${escolha.n}`} />
        <Mapa />
      </main>
      <Footer />
    </>
  )
}
