import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StudyCardProps {
  front: string;
  back: string;
  flipped: boolean;
  onFlip: () => void;
  transitioning?: boolean;
  className?: string;
}

const StudyCard = ({
  front, back, flipped, onFlip, transitioning = false, className,
}: StudyCardProps): JSX.Element => {
  const [pressing, setPressing] = useState(false);

  const handleClick = (): void => {
    if (flipped || pressing) return;
    setPressing(true);
    setTimeout(() => {
      onFlip();
      setPressing(false);
    }, 130);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const getShadowClass = (): string => {
    if (pressing) return 'neu-deep-press scale-[0.955]';
    if (flipped) return 'neu-answered';
    return 'neu-raised cursor-pointer';
  };

  const animateOpacity = transitioning ? 0 : 1;
  const animateDuration = transitioning ? 0.12 : 0.18;

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Study card"
      className={cn(
        'rounded-3xl overflow-hidden select-none transition-all duration-200',
        getShadowClass(),
        className,
      )}
    >
      <div className="min-h-[220px] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-xs uppercase tracking-widest text-muted font-body mb-3">Question</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={front}
            initial={{ opacity: 0 }}
            animate={{ opacity: animateOpacity, transition: { duration: animateDuration } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="font-display text-xl font-semibold text-neu leading-snug"
          >
            {front}
          </motion.p>
        </AnimatePresence>
        {!flipped && (
          <p className="text-xs text-muted font-body mt-5 opacity-50">tap to reveal · space</p>
        )}
      </div>

      <AnimatePresence initial={false}>
        {flipped && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              height: '1px', margin: '0 2rem', background: 'var(--neu-shadow-dark)', opacity: 0.4,
            }}
            />
            <div className="p-8 pt-6 text-center">
              <p className="text-xs uppercase tracking-widest text-accent font-body mb-3">Answer</p>
              <p className="font-display text-xl font-semibold text-neu leading-snug">{back}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyCard;
