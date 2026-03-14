import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeuToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const NeuToggle = ({
  checked, onChange, label, disabled, className,
}: NeuToggleProps): JSX.Element => {
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) onChange(!checked);
    }
  };

  return (
    <div className={cn('flex items-center gap-3 select-none', disabled && 'opacity-40', className)}>
      <div
        role="switch"
        aria-checked={checked}
        aria-label={label ?? 'toggle'}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={cn(
          'cursor-pointer relative w-12 h-6 rounded-full transition-all duration-200 neu-inset',
          disabled && 'cursor-not-allowed',
        )}
      >
        <motion.div
          animate={{ x: checked ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className="absolute top-1 w-4 h-4 rounded-full neu-raised"
          style={{ background: checked ? 'var(--neu-accent)' : 'var(--neu-bg)' }}
        />
      </div>
      {label && <span className="text-sm font-body text-neu cursor-default">{label}</span>}
    </div>
  );
};

export default NeuToggle;
