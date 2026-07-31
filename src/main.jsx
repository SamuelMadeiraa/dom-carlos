import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import App from './App.jsx'
import { iniciar } from './dados/store.js'
import './styles.css'

/* descobre se existe agenda na nuvem antes de qualquer tela precisar dela;
   não é await porque a página não deve esperar rede para aparecer */
iniciar()

const raiz = ReactDOM.createRoot(document.getElementById('root'))

raiz.render(
  <React.StrictMode>
    {/* reducedMotion="user" respeita quem desligou animações no sistema —
        importante aqui, porque a página tem bastante movimento */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>
)
