import { cn } from '@/lib/utils';

interface NeuSliderProps {
  label?: string
  min?: number
  max?: number
  step?: number
  value: number
  onChange: (value: number) => void
  showValue?: boolean
  className?: string
}

export default function NeuSlider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  showValue = true,
  className,
}: NeuSliderProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs uppercase tracking-widest text-muted font-body">{label}</span>
          )}
          {showValue && (
            <span className="neu-inset rounded-full px-3 py-1 text-xs font-body text-accent font-semibold ml-auto">
              {value}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="neu-slider w-full"
      />
    </div>
  );
}
