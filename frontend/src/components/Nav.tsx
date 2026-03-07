import { motion } from 'framer-motion'
import ApiStatus from './ApiStatus'

interface NavProps {
  isDark: boolean
  onToggleTheme: () => void
}

export default function Nav({ isDark, onToggleTheme }: NavProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5"
      style={{ background: 'linear-gradient(to bottom, var(--neu-bg) 70%, transparent 100%)' }}
    >
      <span className="font-display text-xl font-bold tracking-tight text-neu">
        mem<span className="text-accent">o</span>rise
      </span>

      <div className="flex items-center gap-5">
        <ApiStatus />

        <button
          onClick={onToggleTheme}
          className="neu-btn w-9 h-9 rounded-full flex items-center justify-center text-sm"
          aria-label="Toggle theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <button className="neu-btn px-5 py-2 rounded-xl text-sm font-body font-semibold text-accent">
          Sign In
        </button>
      </div>
    </motion.nav>
  )
}
