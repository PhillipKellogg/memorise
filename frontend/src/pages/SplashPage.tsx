import { useRef, useState } from 'react';
import {
  motion, useScroll, useTransform, AnimatePresence,
} from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import FlipCard from '@/components/FlipCard';
import NeuButton from '@/components/NeuButton';
import { usePublicDeckCards, useMyDecks, usePublicDecks } from '@/queries';
import { useAuth } from '@/hooks/useAuth';

interface SplashPageProps {
  isDark: boolean
  onToggleTheme: () => void
}

const GHOST_CARDS = [
  { front: 'What is the mitochondria?', back: 'The powerhouse of the cell.' },
  { front: "Newton's First Law?", back: 'An object in motion stays in motion.' },
  { front: 'Spaced repetition?', back: 'Review right before you forget.' },
];

const FEATURES = [
  {
    icon: '🧠',
    title: 'Actually sticks',
    description: "The SM-2 algorithm shows you cards right before you'd forget them. 10 minutes a day, retain for years.",
  },
  {
    icon: '📱',
    title: 'Any device, any time',
    description: "Open a browser on your phone, tablet, or desktop. It's just a URL — no app, no sync delay.",
  },
  {
    icon: '🔒',
    title: 'Your data, full stop',
    description: 'Nothing goes to a third-party server. Your cards live on your machine, always.',
  },
  {
    icon: '⚡',
    title: 'In and out fast',
    description: 'Sessions take minutes. No bloat, no gamification — just the cards you need to see today.',
  },
  {
    icon: '🗂',
    title: 'Organized by deck',
    description: 'Group cards by subject, language, or project. Study one deck or all of them.',
  },
  {
    icon: '📈',
    title: 'Knowledge compounds',
    description: "The longer you use it, the less time each session takes. That's the whole idea.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  }),
};

interface GhostCardProps {
  text: string
  style?: React.CSSProperties
  className?: string
}

const GhostCard = ({ text, style, className }: GhostCardProps): JSX.Element => (
  <div
    className={`absolute rounded-2xl neu-raised pointer-events-none flex items-center justify-center p-5 ${className ?? ''}`}
    style={style}
  >
    <p className="text-center font-display text-xs font-semibold leading-snug text-neu opacity-40 line-clamp-3">
      {text}
    </p>
  </div>
);

const MyDecks = (): JSX.Element | null => {
  const navigate = useNavigate();
  const { data: decks, isLoading } = useMyDecks();

  if (isLoading) return null;
  if (!decks?.length) {
    return (
      <div className="text-center text-muted text-sm font-body py-8 opacity-60">
        No decks yet —
        {' '}
        <Link to="/browse" className="text-accent">browse public decks</Link>
        {' '}
        to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck, i) => (
        <motion.button
          key={deck.id}
          type="button"
          custom={i}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/study/${deck.id}`)}
          className="neu-raised rounded-2xl p-5 text-left flex flex-col gap-2"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-display font-semibold text-neu text-sm leading-snug">{deck.title}</p>
            {deck.cards_due > 0 ? (
              <span className="shrink-0 neu-inset rounded-full px-3 py-1 text-xs font-body text-accent font-semibold">
                {deck.cards_due}
                {' '}
                due
              </span>
            ) : (
              <span className="shrink-0 neu-inset rounded-full px-3 py-1 text-xs font-body text-muted">
                done ✓
              </span>
            )}
          </div>
          <p className="text-xs text-muted font-body">
            {deck.total_cards}
            {' '}
            cards ·
            {' '}
            {deck.is_owned ? 'yours' : 'community'}
          </p>
        </motion.button>
      ))}
    </div>
  );
};

const DeckTestRun = (): JSX.Element => {
  const { data: publicDecks, isLoading: decksLoading } = usePublicDecks('');
  const firstDeck = publicDecks?.[0];
  const { data: cards, isLoading: cardsLoading } = usePublicDeckCards(firstDeck?.id ?? 0);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  if (decksLoading || cardsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neu-inset rounded-2xl px-8 py-4">
          <p className="text-muted text-sm">Loading deck…</p>
        </div>
      </div>
    );
  }

  if (!firstDeck || !cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neu-inset rounded-2xl px-8 py-6 text-center max-w-sm">
          <p className="text-muted text-sm mb-2">No public decks found.</p>
          <p className="text-muted text-xs opacity-60">
            Run
            <code className="font-mono">python seed.py</code>
            {' '}
            in the backend to create a demo deck.
          </p>
        </div>
      </div>
    );
  }

  const card = cards[index];

  const go = (dir: 1 | -1): void => {
    setDirection(dir);
    setIndex((i) => (i + dir + cards.length) % cards.length);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent mb-0.5">Live deck</p>
          <p className="font-display font-semibold text-neu">{firstDeck.title}</p>
        </div>
        <span className="neu-inset rounded-full px-4 py-1.5 text-xs text-muted font-body">
          {index + 1}
          {' '}
          /
          {cards.length}
        </span>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={card.id}
          custom={direction}
          initial={{ x: direction * 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -40, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="h-56"
        >
          <FlipCard front={card.front} back={card.back} className="w-full h-full" />
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-4 mt-6">
        <NeuButton onClick={() => go(-1)}>← Prev</NeuButton>
        <NeuButton variant="accent" onClick={() => go(1)}>Next →</NeuButton>
      </div>
    </div>
  );
};

const MyDecksSection = (): JSX.Element | null => {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mb-8"
        >
          <motion.p custom={0} variants={fadeUp} className="text-xs uppercase tracking-widest text-accent mb-2">
            My decks
          </motion.p>
          <motion.h2 custom={1} variants={fadeUp} className="font-display text-2xl font-bold text-neu">
            Continue studying
          </motion.h2>
        </motion.div>
        <MyDecks />
      </div>
    </section>
  );
};

const SplashPage = ({ isDark, onToggleTheme }: SplashPageProps): JSX.Element => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const c1Y = useTransform(scrollY, [0, 600], [0, -160]);
  const c1R = useTransform(scrollY, [0, 600], [-6, -20]);
  const c1O = useTransform(scrollY, [0, 400], [1, 0]);

  const c2Y = useTransform(scrollY, [0, 600], [0, -100]);
  const c2R = useTransform(scrollY, [0, 600], [8, 22]);
  const c2O = useTransform(scrollY, [0, 480], [0.8, 0]);

  const c3Y = useTransform(scrollY, [0, 600], [0, -200]);
  const c3R = useTransform(scrollY, [0, 600], [-3, -14]);
  const c3O = useTransform(scrollY, [0, 340], [0.6, 0]);

  const heroY = useTransform(scrollY, [0, 400], [0, 55]);
  const heroO = useTransform(scrollY, [0, 340], [1, 0]);

  return (
    <div className="min-h-screen font-body" style={{ background: 'var(--neu-bg)' }}>
      <Nav isDark={isDark} onToggleTheme={onToggleTheme} />

      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden"
      >
        <motion.div style={{ y: c1Y, rotate: c1R, opacity: c1O }} className="absolute -left-48 lg:-left-24 xl:left-[6%] top-[16%] w-64 h-44">
          <GhostCard text={GHOST_CARDS[0].front} className="w-full h-full" />
        </motion.div>
        <motion.div style={{ y: c2Y, rotate: c2R, opacity: c2O }} className="absolute -right-48 lg:-right-24 xl:right-[5%] top-[22%] w-56 h-40">
          <GhostCard text={GHOST_CARDS[1].front} className="w-full h-full" />
        </motion.div>
        <motion.div style={{ y: c3Y, rotate: c3R, opacity: c3O }} className="absolute -left-48 lg:-left-24 xl:left-[16%] bottom-[18%] w-52 h-36">
          <GhostCard text={GHOST_CARDS[2].front} className="w-full h-full" />
        </motion.div>

        <motion.div
          style={{ y: heroY, opacity: heroO }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full neu-raised-sm text-xs font-body text-accent mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" style={{ background: 'var(--neu-accent)' }} />
            Self-hosted · No subscriptions · Open source
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6 text-neu"
          >
            Remember more.
            <br />
            <span style={{ color: 'var(--neu-accent)' }}>Own everything.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-muted text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10"
          >
            Memorise is a flashcard app that runs on your own server. Study on your phone,
            your laptop, your tablet — your cards are always there, and always private.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/browse">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="neu-btn px-8 py-3.5 rounded-2xl text-accent font-body font-semibold text-base"
              >
                Start Reviewing
              </motion.button>
            </Link>
            <Link to="/how-it-works">
              <motion.span
                whileHover={{ scale: 1.02 }}
                className="inline-block px-8 py-3.5 rounded-2xl neu-inset text-muted font-body font-medium text-base cursor-pointer"
              >
                How it works
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <MyDecksSection />

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-14"
          >
            <motion.p custom={0} variants={fadeUp} className="text-xs uppercase tracking-widest text-accent mb-3">
              Try it now
            </motion.p>
            <motion.h2 custom={1} variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-neu">
              This is a real deck from the app
            </motion.h2>
            <motion.p custom={2} variants={fadeUp} className="text-muted mt-3">
              Tap a card to reveal the answer. Use the arrows to navigate.
            </motion.p>
          </motion.div>
          <DeckTestRun />
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-14"
          >
            <motion.p custom={0} variants={fadeUp} className="text-xs uppercase tracking-widest text-accent mb-3">
              Features
            </motion.p>
            <motion.h2 custom={1} variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-neu">
              Built to fit into your life
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                whileHover={{ y: -4 }}
                className="neu-raised rounded-3xl p-7"
              >
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-display text-base font-semibold text-neu mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="neu-raised rounded-3xl p-12 text-center"
          >
            <motion.h2 custom={0} variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-neu mb-4">
              Ready to start?
            </motion.h2>
            <motion.p custom={1} variants={fadeUp} className="text-muted mb-8">
              Self-host it in minutes. Your server, your rules, your data.
            </motion.p>
            <motion.div custom={2} variants={fadeUp} className="flex items-center justify-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="neu-btn px-10 py-4 rounded-2xl text-accent font-body font-semibold"
              >
                Get Started
              </motion.button>
              <Link to="/how-it-works">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  className="inline-block px-8 py-4 rounded-2xl neu-raised text-muted font-body font-medium cursor-pointer text-sm"
                >
                  How it works →
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-6 neu-inset mt-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-sm font-bold text-muted">
            mem
            <span style={{ color: 'var(--neu-accent)' }}>o</span>
            rise
          </span>
          <span className="text-xs text-muted">
            MIT License · Self-hosted ·
            {' '}
            {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default SplashPage;
