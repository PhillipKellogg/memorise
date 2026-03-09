import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'accent' | 'danger' | 'success' | 'warning'
type Size = 'sm' | 'md' | 'lg'

interface NeuButtonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const variantClass: Record<Variant, string> = {
  default: 'text-muted',
  accent:  'text-accent font-semibold',
  danger:  'text-red-400',
  success: 'text-green-500 font-semibold',
  warning: 'text-orange-400',
}

const sizeClass: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs rounded-xl',
  md: 'px-6 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3.5 text-base rounded-2xl',
}

export default function NeuButton({
  variant = 'default',
  size = 'md',
  className,
  children,
  disabled,
  type = 'button',
  onClick,
}: NeuButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'neu-btn font-body disabled:opacity-40',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
    >
      {children}
    </motion.button>
  )
}
