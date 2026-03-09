import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Nav from '@/components/Nav'
import { useEnroll, useNextCard, useReviewCard, studyKeys } from '@/queries'
import { useQueryClient } from '@tanstack/react-query'
import type { StudyCard } from '@/types'

interface StudyPageProps {
  isDark: boolean
  onToggleTheme: () => void
}

const RATINGS = [
  { value: 1, label: 'Forgot',  key: '1', color: 'text-red-400' },
  { value: 2, label: 'Hard',    key: '2', color: 'text-orange-400' },
  { value: 3, label: 'Medium',  key: '3', color: 'text-accent' },
  { value: 4, label: 'Easy',    key: '4', color: 'text-green-500' },
] as const

function FlipStudyCard({
  card,
  flipped,
  onFlip,
}: {
  card: StudyCard
  flipped: boolean
  onFlip: () => void
}) {
  return (
    <div
      className="relative w-full cursor-pointer"
      style={{ height: '280px', perspective: '1200px' }}
      onClick={onFlip}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 neu-raised rounded-3xl flex flex-col items-center justify-center p-8"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-xs uppercase tracking-widest text-muted font-body mb-4">Question</p>
          <p className="font-display text-xl font-semibold text-neu text-center leading-snug">{card.front}</p>
          {!flipped && (
            <p className="absolute bottom-5 text-xs text-muted font-body opacity-50">
              tap to reveal · space
            </p>
          )}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 neu-raised rounded-3xl flex flex-col items-center justify-center p-8"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-xs uppercase tracking-widest text-muted font-body mb-4">Answer</p>
          <p className="font-display text-xl font-semibold text-neu text-center leading-snug">{card.back}</p>
        </div>
      </motion.div>
    </div>
  )
}

export default function StudyPage({ isDark, onToggleTheme }: StudyPageProps) {
  const { deckId } = useParams<{ deckId: string }>()
  const id = Number(deckId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const enroll = useEnroll()
  const { data: card, isLoading } = useNextCard(id)
  const reviewCard = useReviewCard()

  const [flipped, setFlipped] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  // Enroll on mount (idempotent)
  useEffect(() => {
    if (id) enroll.mutate(id)
  }, [id])

  // Session done when card is null and we've reviewed at least one
  useEffect(() => {
    if (!isLoading && card === null) setSessionDone(true)
  }, [card, isLoading])

  // Keyboard: space to flip, 1-4 to rate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        if (!flipped && card) setFlipped(true)
      }
      if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
        handleRate(Number(e.key))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [flipped, card])

  const handleRate = async (rating: number) => {
    if (!card || isSubmitting) return
    setIsSubmitting(true)
    setFlipped(false)

    const next = await reviewCard.mutateAsync({ deckId: id, cardId: card.id, rating })
    setReviewed(r => r + 1)

    // Manually update the query cache with the next card returned from the review endpoint
    queryClient.setQueryData(studyKeys.next(id), next ?? null)
    if (!next) setSessionDone(true)

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen font-body" style={{ background: 'var(--neu-bg)' }}>
      <Nav isDark={isDark} onToggleTheme={onToggleTheme} />

      <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {sessionDone ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <div className="neu-raised rounded-3xl p-12 mb-8">
                  <p className="text-4xl mb-4">🎉</p>
                  <h2 className="font-display text-2xl font-bold text-neu mb-3">All done!</h2>
                  <p className="text-muted font-body text-sm">
                    You reviewed {reviewed} {reviewed === 1 ? 'card' : 'cards'}.
                    Come back tomorrow for more.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Link to="/browse">
                    <button type="button" className="neu-btn px-6 py-3 rounded-2xl text-sm font-body font-semibold text-muted">
                      Browse more decks
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="neu-btn px-6 py-3 rounded-2xl text-sm font-body font-semibold text-accent"
                  >
                    Back home
                  </button>
                </div>
              </motion.div>
            ) : isLoading || !card ? (
              <motion.div key="loading" className="text-center text-muted font-body text-sm">
                Loading…
              </motion.div>
            ) : (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                {/* Card */}
                <FlipStudyCard card={card} flipped={flipped} onFlip={() => !flipped && setFlipped(true)} />

                {/* Rating buttons */}
                <AnimatePresence>
                  {flipped && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-4 gap-3 mt-6"
                    >
                      {RATINGS.map(r => (
                        <motion.button
                          key={r.value}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRate(r.value)}
                          disabled={isSubmitting}
                          className={`neu-btn rounded-2xl py-4 flex flex-col items-center gap-1.5 disabled:opacity-40 ${r.color}`}
                        >
                          <span className="text-xs font-body font-bold opacity-50">{r.key}</span>
                          <span className="text-sm font-body font-semibold">{r.label}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hint */}
                {!flipped && (
                  <p className="text-center text-xs text-muted font-body mt-6 opacity-60">
                    Rate your recall after flipping · use keys 1–4
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
