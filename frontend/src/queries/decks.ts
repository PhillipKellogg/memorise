import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Deck, Card, PublicDeck } from '@/types';

export const deckKeys = {
  all: ['decks'] as const,
  public: (search: string) => ['decks', 'public', search] as const,
  detail: (id: number) => ['decks', id] as const,
  cards: (id: number) => ['decks', id, 'cards'] as const,
};

export function usePublicDecks(search: string) {
  return useQuery({
    queryKey: deckKeys.public(search),
    queryFn: async () => {
      const { data } = await api.get<PublicDeck[]>('/decks/public', {
        params: search ? { search } : {},
      });
      return data;
    },
  });
}

export function useDecks() {
  return useQuery({
    queryKey: deckKeys.all,
    queryFn: async () => {
      const { data } = await api.get<Deck[]>('/decks');
      return data;
    },
  });
}

export function useDeck(id: number) {
  return useQuery({
    queryKey: deckKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<Deck>(`/decks/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useDeckCards(deckId: number) {
  return useQuery({
    queryKey: deckKeys.cards(deckId),
    queryFn: async () => {
      const { data } = await api.get<Card[]>(`/decks/${deckId}/cards`);
      return data;
    },
    enabled: !!deckId,
  });
}

export function usePublicDeckCards(deckId: number) {
  return useQuery({
    queryKey: ['decks', 'public', deckId, 'cards'] as const,
    queryFn: async () => {
      const { data } = await api.get<Card[]>(`/decks/public/${deckId}/cards`);
      return data;
    },
    enabled: !!deckId,
  });
}

export function useCreateDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; description?: string }) => {
      const { data } = await api.post<Deck>('/decks', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deckKeys.all });
    },
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ deckId, front, back }: { deckId: number; front: string; back: string }) => {
      const { data } = await api.post<Card>(`/decks/${deckId}/cards`, { front, back });
      return data;
    },
    onSuccess: (_, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: deckKeys.cards(deckId) });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      deckId, cardId, front, back,
    }: { deckId: number; cardId: number; front: string; back: string }) => {
      const { data } = await api.patch<Card>(`/decks/${deckId}/cards/${cardId}`, { front, back });
      return data;
    },
    onSuccess: (_, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: deckKeys.cards(deckId) });
    },
  });
}
