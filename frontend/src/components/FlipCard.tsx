import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FlipCardProps {
  front: string
  back: string
  className?: string
}

export default function FlipCard({ front, back, className }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [pressing, setPressing] = useState(false);

  const handleClick = () => {
    if (pressing) return;
    setPressing(true);
    setTimeout(() => {
      setFlipped((f) => !f);
      setPressing(false);
    }, 160);
  };

  // Shadow class: raised → deep-press during click → answered (soft inset) when flipped
  const shadowClass = pressing
    ? 'neu-deep-press'
    : flipped
      ? 'neu-answered'
      : 'neu-raised neu-card-hover';

  return (
    <div
      onClick={handleClick}
      role="button"
      aria-label={flipped ? 'Show question' : 'Reveal answer'}
      className={cn(
        'cursor-pointer select-none rounded-2xl overflow-hidden relative',
        shadowClass,
        pressing && 'scale-[0.97]',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {pressing ? (
          // Blank during the press moment — nothing to show mid-transition
          <motion.div key="blank" className="absolute inset-0" />
        ) : !flipped ? (
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
        ) : (
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
}
