import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import { useCreateDeck, useCreateCard, useUpdateCard } from '@/queries';
import type { Deck } from '@/types';

interface DeckBuilderPageProps {
  isDark: boolean
  onToggleTheme: () => void
}

interface LocalCard {
  id: number
  front: string
  back: string
}

const DeckBuilderPage = ({ isDark, onToggleTheme }: DeckBuilderPageProps): JSX.Element => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'name' | 'cards'>('name');
  const [title, setTitle] = useState('');
  const [deck, setDeck] = useState<Deck | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [addedCards, setAddedCards] = useState<LocalCard[]>([]);
  const [editingCard, setEditingCard] = useState<LocalCard | null>(null);

  const createDeck = useCreateDeck();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();

  const isPending = createCard.isPending || updateCard.isPending;

  const handleCreateDeck = async (): Promise<void> => {
    if (!title.trim() || createDeck.isPending) return;
    const d = await createDeck.mutateAsync({ title: title.trim() });
    setDeck(d);
    setPhase('cards');
  };

  const handleAddCard = async (): Promise<void> => {
    if (!front.trim() || !back.trim() || !deck || isPending) return;
    const card = await createCard.mutateAsync({
      deckId: deck.id, front: front.trim(), back: back.trim(),
    });
    setAddedCards((prev) => [...prev, { id: card.id, front: card.front, back: card.back }]);
    setFront('');
    setBack('');
  };

  const handleSelectCard = (card: LocalCard): void => {
    setEditingCard(card);
    setFront(card.front);
    setBack(card.back);
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!front.trim() || !back.trim() || !deck || !editingCard || isPending) return;
    await updateCard.mutateAsync({
      deckId: deck.id, cardId: editingCard.id, front: front.trim(), back: back.trim(),
    });
    setAddedCards((prev) => prev.map((c) => {
      if (c.id !== editingCard.id) return c;
      return { ...c, front: front.trim(), back: back.trim() };
    }));
    setEditingCard(null);
    setFront('');
    setBack('');
  };

  const handleCancelEdit = (): void => {
    setEditingCard(null);
    setFront('');
    setBack('');
  };

  return (
    <div className="min-h-screen font-body" style={{ background: 'var(--neu-bg)' }}>
      <Nav isDark={isDark} onToggleTheme={onToggleTheme} />

      <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {phase === 'name' ? (
              <motion.div
                key="name"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              >
                <p className="text-xs uppercase tracking-widest text-accent mb-3 text-center">New deck</p>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-neu text-center mb-10">
                  Name your deck
                </h1>

                <input
                  className="neu-input w-full mb-6"
                  placeholder="e.g. Japanese N5 Vocabulary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e): void => { if (e.key === 'Enter') void handleCreateDeck(); }}
                />

                <div className="flex items-center justify-between">
                  <Link to="/">
                    <span className="text-sm text-muted font-body hover:text-accent transition-colors cursor-pointer">
                      ← Back
                    </span>
                  </Link>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { void handleCreateDeck(); }}
                    disabled={!title.trim() || createDeck.isPending}
                    className="neu-btn px-8 py-3 rounded-2xl text-accent font-body font-semibold text-sm disabled:opacity-40"
                  >
                    {createDeck.isPending ? 'Creating…' : 'Create deck →'}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="cards"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-accent mb-0.5">
                      {editingCard ? 'Editing card' : 'Adding cards'}
                    </p>
                    <p className="font-display font-semibold text-neu">{deck?.title}</p>
                  </div>
                  <span className="neu-inset rounded-full px-4 py-1.5 text-xs text-muted font-body">
                    {addedCards.length}
                    {' '}
                    {addedCards.length === 1 ? 'card' : 'cards'}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted mb-2 font-body">Front</p>
                    <textarea
                      className="neu-input w-full resize-none"
                      rows={3}
                      placeholder="Question or prompt…"
                      value={front}
                      onChange={(e) => setFront(e.target.value)}
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted mb-2 font-body">Back</p>
                    <textarea
                      className="neu-input w-full resize-none"
                      rows={3}
                      placeholder="Answer…"
                      value={back}
                      onChange={(e) => setBack(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-10">
                  {editingCard ? (
                    <div className="flex items-center gap-3">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { void handleSaveEdit(); }}
                        disabled={!front.trim() || !back.trim() || isPending}
                        className="neu-btn px-8 py-3 rounded-2xl text-accent font-body font-semibold text-sm disabled:opacity-40"
                      >
                        {updateCard.isPending ? 'Saving…' : 'Save changes'}
                      </motion.button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCancelEdit}
                        className="neu-btn px-5 py-3 rounded-2xl text-muted font-body font-semibold text-sm"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { void handleAddCard(); }}
                      disabled={!front.trim() || !back.trim() || isPending}
                      className="neu-btn px-8 py-3 rounded-2xl text-accent font-body font-semibold text-sm disabled:opacity-40"
                    >
                      {createCard.isPending ? 'Adding…' : '+ Add card'}
                    </motion.button>
                  )}

                  {!editingCard && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('/')}
                      className="neu-btn px-8 py-3 rounded-2xl text-muted font-body font-semibold text-sm"
                    >
                      Done ✓
                    </motion.button>
                  )}
                </div>

                {addedCards.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted mb-3 font-body">Added</p>
                    <div className="flex flex-wrap gap-2">
                      {addedCards.map((c) => (
                        <motion.button
                          key={c.id}
                          type="button"
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => handleSelectCard(c)}
                          className={`neu-btn rounded-xl px-4 py-2 text-xs font-body max-w-[200px] truncate text-left transition-colors ${
                            editingCard?.id === c.id ? 'text-accent' : 'text-muted'
                          }`}
                        >
                          {c.front}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default DeckBuilderPage;
