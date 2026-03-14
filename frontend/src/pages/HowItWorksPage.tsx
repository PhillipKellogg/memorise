import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Nav from '@/components/Nav';

interface Props {
  isDark: boolean
  onToggleTheme: () => void
}

const STEPS = [
  {
    step: '01',
    title: 'Create a deck',
    body: "A deck is a collection of cards on one topic — Spanish verbs, circuit diagrams, historical dates, anything. Name it and you're done.",
  },
  {
    step: '02',
    title: 'Add your cards',
    body: 'Each card has a front (the question or prompt) and a back (the answer). Plain text for now — rich media coming soon.',
  },
  {
    step: '03',
    title: 'Review when due',
    body: "The app tracks when each card is due based on how well you've recalled it. Open it on any device — your queue is waiting.",
  },
  {
    step: '04',
    title: 'Rate your recall',
    body: 'After seeing the answer, you rate how well you remembered it. That rating drives the scheduling algorithm.',
  },
  {
    step: '05',
    title: 'The algorithm does the rest',
    body: 'Cards you know well get pushed further out — weeks, then months. Cards you struggle with come back sooner. You study less over time, not more.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  }),
};

const HowItWorksPage = ({ isDark, onToggleTheme }: Props): JSX.Element => (
  <div className="min-h-screen font-body" style={{ background: 'var(--neu-bg)' }}>
    <Nav isDark={isDark} onToggleTheme={onToggleTheme} />

    <div className="max-w-3xl mx-auto px-6 pt-36 pb-24">
      <motion.div
        initial="hidden"
        animate="visible"
        className="mb-16"
      >
        <motion.p custom={0} variants={fadeUp} className="text-xs uppercase tracking-widest text-accent mb-3">
          How it works
        </motion.p>
        <motion.h1 custom={1} variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold text-neu mb-5">
          Simple by design.
        </motion.h1>
        <motion.p custom={2} variants={fadeUp} className="text-muted text-lg leading-relaxed">
          Memorise doesn&apos;t have tutorials or onboarding flows.
          Here&apos;s everything you need to know.
        </motion.p>
      </motion.div>

      <div className="space-y-5">
        {STEPS.map((item, i) => (
          <motion.div
            key={item.step}
            custom={i + 3}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-30px' }}
            className="neu-raised rounded-3xl p-8 flex gap-8"
          >
            <span className="font-display text-5xl font-bold shrink-0 leading-none" style={{ color: 'var(--neu-accent)', opacity: 0.15 }}>
              {item.step}
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold text-neu mb-2">{item.title}</h3>
              <p className="text-muted leading-relaxed">{item.body}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-14 text-center"
      >
        <Link to="/">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-2xl neu-raised text-accent font-body font-semibold"
          >
            ← Back
          </motion.button>
        </Link>
      </motion.div>
    </div>
  </div>
);

export default HowItWorksPage;
