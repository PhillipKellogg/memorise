import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Nav from '@/components/Nav'
import StudyCard from '@/components/StudyCard'
import NeuButton from '@/components/NeuButton'
import { useEnroll, useNextCard, useReviewCard, studyKeys } from '@/queries'
import { useQueryClient } from '@tanstack/react-query'

interface StudyPageProps {
  isDark: boolean
  onToggleTheme: () => void
}

const RATINGS = [
  { value: 1, label: 'Forgot',  key: '1', variant: 'danger'   as const },
  { value: 2, label: 'Hard',    key: '2', variant: 'warning'  as const },
  { value: 3, label: 'Medium',  key: '3', variant: 'accent'   as const },
  { value: 4, label: 'Easy',    key: '4', variant: 'success'  as const },
] as const

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
  const [textFading, setTextFading] = useState(false)
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
    setTextFading(true)   // start fading text immediately, before API call
    setIsSubmitting(true)
    setFlipped(false)

    const next = await reviewCard.mutateAsync({ deckId: id, cardId: card.id, rating })
    setReviewed(r => r + 1)

    // Manually update the query cache with the next card returned from the review endpoint
    queryClient.setQueryData(studyKeys.next(id), next ?? null)
    if (!next) setSessionDone(true)

    setTextFading(false)
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
                    <NeuButton size="lg" className="rounded-2xl">Browse more decks</NeuButton>
                  </Link>
                  <NeuButton variant="accent" size="lg" className="rounded-2xl" onClick={() => navigate('/')}>
                    Back home
                  </NeuButton>
                </div>
              </motion.div>
            ) : isLoading || !card ? (
              <motion.div key="loading" className="text-center text-muted font-body text-sm">
                Loading…
              </motion.div>
            ) : (
              <div>
                {/* Card — stays in place, text fades inside */}
                <StudyCard
                  front={card.front}
                  back={card.back}
                  flipped={flipped}
                  onFlip={() => !flipped && setFlipped(true)}
                  transitioning={textFading}
                />

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
                        <NeuButton
                          key={r.value}
                          variant={r.variant}
                          disabled={isSubmitting}
                          onClick={() => handleRate(r.value)}
                          className="rounded-2xl py-4 flex flex-col items-center gap-1.5"
                        >
                          <span className="text-xs font-bold opacity-50">{r.key}</span>
                          <span className="text-sm">{r.label}</span>
                        </NeuButton>
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
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
