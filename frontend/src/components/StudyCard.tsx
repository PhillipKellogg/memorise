import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StudyCardProps {
  front: string
  back: string
  flipped: boolean
  onFlip: () => void
  className?: string
}

export default function StudyCard({ front, back, flipped, onFlip, className }: StudyCardProps) {
  const [pressing, setPressing] = useState(false)

  const handleClick = () => {
    if (flipped || pressing) return
    setPressing(true)
    setTimeout(() => {
      onFlip()
      setPressing(false)
    }, 130)
  }

  const shadowClass = pressing
    ? 'neu-deep-press scale-[0.98]'
    : flipped
    ? 'neu-answered'
    : 'neu-raised cursor-pointer'

  return (
    <div
      onClick={handleClick}
      className={cn('rounded-3xl overflow-hidden select-none transition-all duration-200', shadowClass, className)}
    >
      {/* Question — fixed height, question stays put when answer reveals below */}
      <div className="min-h-[220px] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-xs uppercase tracking-widest text-muted font-body mb-3">Question</p>
        <p className="font-display text-xl font-semibold text-neu leading-snug text-center">{front}</p>
        {!flipped && (
          <p className="text-xs text-muted font-body mt-5 opacity-50">tap to reveal · space</p>
        )}
      </div>

      {/* Answer — pure CSS max-height reveal, no jumping */}
      <div
        className="overflow-hidden"
        style={{
          maxHeight: flipped ? '500px' : '0',
          opacity: flipped ? 1 : 0,
          transition: 'max-height 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
        }}
      >
        <div className="mx-8 border-t" style={{ borderColor: 'var(--neu-shadow-dark)', opacity: 0.25 }} />
        <div className="p-8 pt-6 text-center">
          <p className="text-xs uppercase tracking-widest text-accent font-body mb-3">Answer</p>
          <p className="font-display text-xl font-semibold text-neu leading-snug">{back}</p>
        </div>
      </div>
    </div>
  )
}
