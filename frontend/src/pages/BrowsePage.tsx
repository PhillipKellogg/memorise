import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import { usePublicDecks } from '@/queries';
import { useAuth } from '@/contexts/AuthContext';
import type { PublicDeck } from '@/types';

interface BrowsePageProps {
  isDark: boolean
  onToggleTheme: () => void
}

const DeckCard = ({ deck, index }: { deck: PublicDeck; index: number }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="neu-raised rounded-2xl p-6 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display font-semibold text-neu text-lg leading-snug">{deck.title}</h3>
        <span className="neu-inset shrink-0 rounded-full px-3 py-1 text-xs text-muted font-body">
          {deck.card_count}
          {' '}
          {deck.card_count === 1 ? 'card' : 'cards'}
        </span>
      </div>

      {deck.description && (
        <p className="text-sm text-muted font-body leading-relaxed line-clamp-2">{deck.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-xs text-muted font-body">
          by
          {deck.owner_username}
        </span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => (user ? navigate(`/study/${deck.id}`) : navigate('/login'))}
          className="neu-btn px-5 py-2 rounded-xl text-sm font-body font-semibold text-accent"
        >
          {user ? 'Study →' : 'Sign in to study'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function BrowsePage({ isDark, onToggleTheme }: BrowsePageProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Simple debounce using state + timeout
  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const { data: decks, isLoading } = usePublicDecks(debouncedSearch);

  return (
    <div className="min-h-screen font-body" style={{ background: 'var(--neu-bg)' }}>
      <Nav isDark={isDark} onToggleTheme={onToggleTheme} />

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <p className="text-xs uppercase tracking-widest text-accent mb-3 text-center">Community</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-neu text-center mb-10">
            Browse decks
          </h1>

          <input
            className="neu-input w-full mb-10"
            placeholder="Search decks…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />

          {isLoading ? (
            <div className="text-center text-muted font-body text-sm py-16">Loading…</div>
          ) : !decks?.length ? (
            <div className="text-center text-muted font-body text-sm py-16">
              {debouncedSearch ? 'No decks found.' : 'No public decks yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {decks.map((deck, i) => (
                <DeckCard key={deck.id} deck={deck} index={i} />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
