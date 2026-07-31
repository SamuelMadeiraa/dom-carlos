import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import App from './App.jsx'
import './styles.css'

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
