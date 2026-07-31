import { motion } from 'framer-motion'

const easeOut = [0.16, 1, 0.3, 1]

/** Entrada padrão das seções: sobe e aparece quando entra na tela. */
export default function Reveal({
  children,
  delay = 0,
  y = 34,
  duration = 0.75,
  as = 'div',
  className = '',
  ...rest
}) {
  const Tag = motion[as] || motion.div

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, delay, ease: easeOut }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
