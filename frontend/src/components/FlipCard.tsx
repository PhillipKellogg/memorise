import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FlipCardProps {
  front: string;
  back: string;
  className?: string;
}

const FlipCard = ({ front, back, className }: FlipCardProps): JSX.Element => {
  const [flipped, setFlipped] = useState(false);
  const [pressing, setPressing] = useState(false);

  const handleClick = (): void => {
    if (pressing) return;
    setPressing(true);
    setTimeout(() => {
      setFlipped((f) => !f);
      setPressing(false);
    }, 160);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const getShadowClass = (): string => {
    if (pressing) return 'neu-deep-press';
    if (flipped) return 'neu-answered';
    return 'neu-raised neu-card-hover';
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={flipped ? 'Show question' : 'Reveal answer'}
      className={cn(
        'cursor-pointer select-none rounded-2xl overflow-hidden relative',
        getShadowClass(),
        pressing && 'scale-[0.97]',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {pressing && <motion.div key="blank" className="absolute inset-0" />}
        {!pressing && !flipped && (
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.18 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <span className="text-xs uppercase tracking-widest text-muted mb-4 font-body">
              Question
            </span>
            <p className="text-center text-neu font-display text-lg font-semibold leading-snug">
              {front}
            </p>
            <span className="absolute bottom-4 text-xs text-muted font-body opacity-40">
              tap to reveal
            </span>
          </motion.div>
        )}
        {!pressing && flipped && (
          <motion.div
            key="back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.18 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <span className="text-xs uppercase tracking-widest text-accent mb-4 font-body">
              Answer
            </span>
            <p className="text-center text-neu font-body text-base leading-relaxed">{back}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlipCard;
