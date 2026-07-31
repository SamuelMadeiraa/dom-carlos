/**
 * Ilustrações animadas da barbearia — tesoura, máquina, navalha, poste, pente.
 *
 * Tudo é SVG desenhado à mão e animado com Framer Motion: nada de biblioteca
 * de ícones nem de imagem externa, então o traço combina entre si e o site
 * continua leve. `currentColor` em todos os traços, para o mesmo desenho
 * servir no fundo preto e no branco.
 *
 * O movimento de cada peça imita o gesto real da ferramenta: a tesoura abre
 * e fecha, a máquina vibra, a navalha desdobra, o poste gira.
 */
import { motion } from 'framer-motion'

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

/* ---------------------------------------------------------------- tesoura */
export function Tesoura({ size = 64, animar = true, className = '' }) {
  /* as duas lâminas giram em torno do mesmo parafuso, como a tesoura de verdade */
  const parafuso = { transformOrigin: '50px 54px' }
  const abrirFechar = (sentido) =>
    animar
      ? {
          animate: { rotate: [0, sentido * 9, 0] },
          transition: { duration: 1.7, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.9 },
        }
      : {}

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <motion.g style={parafuso} {...abrirFechar(-1)}>
        <path {...base} d="M26 84 L78 14" />
        <circle {...base} cx="22" cy="88" r="9" />
      </motion.g>

      <motion.g style={parafuso} {...abrirFechar(1)}>
        <path {...base} d="M74 84 L22 14" />
        <circle {...base} cx="78" cy="88" r="9" />
      </motion.g>

      <circle cx="50" cy="54" r="4" fill="currentColor" />
    </svg>
  )
}

/* ---------------------------------------------------------------- máquina */
export function Maquina({ size = 64, animar = true, className = '' }) {
  /* a máquina não "anda": ela treme no lugar, que é o que a vista percebe */
  const tremor = animar
    ? {
        animate: { x: [0, -1.1, 1.1, -0.6, 0], y: [0, 0.6, -0.6, 0.3, 0] },
        transition: { duration: 0.28, repeat: Infinity, ease: 'linear' },
      }
    : {}

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <motion.g {...tremor}>
        {/* corpo */}
        <rect {...base} x="30" y="30" width="40" height="52" rx="7" />
        {/* faixa do motor */}
        <path {...base} d="M30 47 H70" />
        <path {...base} d="M40 60 H60" opacity="0.55" />
        {/* pente / dentes da lâmina */}
        <path {...base} d="M26 30 H74 L70 18 H30 Z" />
        {[34, 42, 50, 58, 66].map((x) => (
          <path key={x} {...base} strokeWidth="3" d={`M${x} 18 V12`} />
        ))}
      </motion.g>
      {/* fio, parado — o contraste com o tremor é o que vende o movimento */}
      <path {...base} strokeWidth="3" d="M50 82 v6 q0 6 -9 6 h-14" opacity="0.5" />
    </svg>
  )
}

/* ---------------------------------------------------------------- navalha */
export function Navalha({ size = 64, animar = true, className = '' }) {
  /* a lâmina desdobra do cabo e volta, como quem abre a navalha na mão */
  const lamina = animar
    ? {
        animate: { rotate: [0, -26, -26, 0] },
        transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.75, 1] },
      }
    : {}

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      {/* cabo */}
      <path {...base} d="M18 74 H74 q8 0 8 -7 t-8 -7 H18 q-6 0 -6 7 t6 7 Z" />
      <circle cx="22" cy="67" r="3" fill="currentColor" />

      <motion.g style={{ transformOrigin: '22px 67px' }} {...lamina}>
        <path {...base} d="M26 60 H76 q10 0 10 -9 H26 Z" />
        <path {...base} strokeWidth="2.5" d="M32 55 H74" opacity="0.5" />
      </motion.g>
    </svg>
  )
}

/* ------------------------------------------------------------------ poste */
export function Poste({ size = 64, animar = true, className = '' }) {
  /* o giro do poste é uma ilusão: as listras sobem sem parar dentro do vidro */
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <clipPath id="vidro-poste">
          <rect x="36" y="22" width="28" height="56" rx="14" />
        </clipPath>
      </defs>

      <g clipPath="url(#vidro-poste)">
        <motion.g
          animate={animar ? { y: [0, -24] } : {}}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        >
          {[-24, 0, 24, 48, 72].map((y) => (
            <path
              key={y}
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="butt"
              fill="none"
              d={`M30 ${y + 34} L70 ${y + 10}`}
            />
          ))}
        </motion.g>
      </g>

      <rect {...base} x="36" y="22" width="28" height="56" rx="14" />
      <path {...base} d="M32 22 H68" />
      <path {...base} d="M32 78 H68" />
      <path {...base} strokeWidth="3" d="M40 14 H60" opacity="0.6" />
      <path {...base} strokeWidth="3" d="M40 86 H60" opacity="0.6" />
    </svg>
  )
}

/* ------------------------------------------------------------------ pente */
export function Pente({ size = 64, animar = true, className = '' }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <motion.g
        animate={animar ? { rotate: [0, -5, 0] } : {}}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 50px' }}
      >
        <path {...base} d="M16 38 H84 q6 0 6 7 t-6 7 H16 q-6 0 -6 -7 t6 -7 Z" />
        {[22, 32, 42, 52, 62, 72, 82].map((x) => (
          <path key={x} {...base} strokeWidth="3.4" d={`M${x} 52 V78`} />
        ))}
      </motion.g>
    </svg>
  )
}

/* ------------------------------------------------------------------ coroa */
export function Coroa({ size = 64, animar = true, className = '' }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <motion.g
        animate={animar ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path {...base} d="M18 72 L14 30 L34 46 L50 22 L66 46 L86 30 L82 72 Z" />
        <path {...base} d="M18 80 H82" />
      </motion.g>
    </svg>
  )
}

const CATALOGO = { tesoura: Tesoura, maquina: Maquina, navalha: Navalha, poste: Poste, pente: Pente, coroa: Coroa }

/** Escolhe a ilustração pelo nome usado no config dos serviços. */
export function Ilustracao({ nome, ...props }) {
  const Componente = CATALOGO[nome] || Tesoura
  return <Componente {...props} />
}

/* ------------------------------------------------- fios de cabelo caindo */
/**
 * Fios caindo no fundo do hero. São poucos e bem transparentes de propósito:
 * a ideia é dar vida ao fundo sem competir com o texto.
 */
export function FiosCaindo({ quantidade = 14 }) {
  const fios = Array.from({ length: quantidade }, (_, i) => ({
    id: i,
    esquerda: (i * 100) / quantidade + (i % 3) * 2.5,
    atraso: (i % 7) * 0.9,
    duracao: 6 + (i % 5) * 1.4,
    tamanho: 16 + (i % 4) * 9,
    curva: i % 2 === 0 ? 6 : -6,
  }))

  return (
    <div className="fios" aria-hidden="true">
      {fios.map((f) => (
        <motion.svg
          key={f.id}
          className="fio"
          style={{ left: `${f.esquerda}%` }}
          width="14"
          height={f.tamanho}
          viewBox={`0 0 14 ${f.tamanho}`}
          initial={{ y: -60, opacity: 0, rotate: 0 }}
          animate={{ y: ['-10vh', '110vh'], opacity: [0, 0.5, 0.5, 0], rotate: [0, f.curva * 14] }}
          transition={{
            duration: f.duracao,
            repeat: Infinity,
            delay: f.atraso,
            ease: 'linear',
            opacity: { duration: f.duracao, repeat: Infinity, delay: f.atraso, times: [0, 0.12, 0.8, 1] },
          }}
        >
          <path
            d={`M7 0 q${f.curva} ${f.tamanho / 2} 0 ${f.tamanho}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </motion.svg>
      ))}
    </div>
  )
}

/* ------------------------------------------------------- divisor cortado */
/**
 * Divisor entre seções: a tesoura atravessa a tela e vai "cortando" a linha
 * pontilhada. É o detalhe que mais entrega o tema sem precisar de texto.
 */
export function LinhaCorte({ className = '' }) {
  return (
    <div className={`linha-corte ${className}`} aria-hidden="true">
      <div className="linha-corte__risco" />
      <motion.div
        className="linha-corte__tesoura"
        initial={{ left: '-6%' }}
        whileInView={{ left: '104%' }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 2.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <Tesoura size={30} />
      </motion.div>
    </div>
  )
}

/* --------------------------------------------------- listras do barbeiro */
/** Faixa de poste usada nas bordas do hero e como assinatura da marca. */
export function Listras({ className = '', animar = true }) {
  return (
    <div className={`listras ${className}`} aria-hidden="true">
      <motion.div
        className="listras__interno"
        animate={animar ? { backgroundPositionY: ['0px', '28px'] } : {}}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
