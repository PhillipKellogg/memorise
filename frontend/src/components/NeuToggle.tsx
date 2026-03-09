import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NeuToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export default function NeuToggle({ checked, onChange, label, disabled, className }: NeuToggleProps) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer select-none group', disabled && 'opacity-40 cursor-not-allowed', className)}>
      <div
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-all duration-200',
          checked ? 'neu-inset' : 'neu-inset',
        )}
      >
        <motion.div
          animate={{ x: checked ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className="absolute top-1 w-4 h-4 rounded-full neu-raised"
          style={{ background: checked ? 'var(--neu-accent)' : 'var(--neu-bg)' }}
        />
      </div>
      {label && (
        <span className="text-sm font-body text-neu">{label}</span>
      )}
    </label>
  )
}
