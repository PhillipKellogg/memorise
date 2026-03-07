import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Deck, Card } from '@/types'

export const deckKeys = {
  all: ['decks'] as const,
  detail: (id: number) => ['decks', id] as const,
  cards: (id: number) => ['decks', id, 'cards'] as const,
}

export function useDecks() {
  return useQuery({
    queryKey: deckKeys.all,
    queryFn: async () => {
      const { data } = await api.get<Deck[]>('/decks')
      return data
    },
  })
}

export function useDeck(id: number) {
  return useQuery({
    queryKey: deckKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<Deck>(`/decks/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useDeckCards(deckId: number) {
  return useQuery({
    queryKey: deckKeys.cards(deckId),
    queryFn: async () => {
      const { data } = await api.get<Card[]>(`/decks/${deckId}/cards`)
      return data
    },
    enabled: !!deckId,
  })
}
