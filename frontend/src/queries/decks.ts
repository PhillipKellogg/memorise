import {
  useQuery, useMutation, useQueryClient,
  type UseQueryResult, type UseMutationResult,
} from '@tanstack/react-query';
import api from '@/lib/api';
import type { Deck, Card, PublicDeck } from '@/types';

export const deckKeys = {
  all: ['decks'] as const,
  public: (search: string) => ['decks', 'public', search] as const,
  detail: (id: number) => ['decks', id] as const,
  cards: (id: number) => ['decks', id, 'cards'] as const,
};

export const usePublicDecks = (search: string): UseQueryResult<PublicDeck[]> => useQuery({
  queryKey: deckKeys.public(search),
  queryFn: async (): Promise<PublicDeck[]> => {
    const { data } = await api.get<PublicDeck[]>('/decks/public', {
      params: search ? { search } : {},
    });
    return data;
  },
});

export const useDecks = (): UseQueryResult<Deck[]> => useQuery({
  queryKey: deckKeys.all,
  queryFn: async (): Promise<Deck[]> => {
    const { data } = await api.get<Deck[]>('/decks');
    return data;
  },
});

export const useDeck = (id: number): UseQueryResult<Deck> => useQuery({
  queryKey: deckKeys.detail(id),
  queryFn: async (): Promise<Deck> => {
    const { data } = await api.get<Deck>(`/decks/${id}`);
    return data;
  },
  enabled: !!id,
});

export const useDeckCards = (deckId: number): UseQueryResult<Card[]> => useQuery({
  queryKey: deckKeys.cards(deckId),
  queryFn: async (): Promise<Card[]> => {
    const { data } = await api.get<Card[]>(`/decks/${deckId}/cards`);
    return data;
  },
  enabled: !!deckId,
});

export const usePublicDeckCards = (deckId: number): UseQueryResult<Card[]> => useQuery({
  queryKey: ['decks', 'public', deckId, 'cards'] as const,
  queryFn: async (): Promise<Card[]> => {
    const { data } = await api.get<Card[]>(`/decks/public/${deckId}/cards`);
    return data;
  },
  enabled: !!deckId,
});

type CreateDeckVars = { title: string; description?: string };

export const useCreateDeck = (): UseMutationResult<Deck, Error, CreateDeckVars> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDeckVars): Promise<Deck> => {
      const { data } = await api.post<Deck>('/decks', payload);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deckKeys.all });
    },
  });
};

type CreateCardVars = { deckId: number; front: string; back: string };

export const useCreateCard = (): UseMutationResult<Card, Error, CreateCardVars> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ deckId, front, back }: CreateCardVars): Promise<Card> => {
      const { data } = await api.post<Card>(`/decks/${deckId}/cards`, { front, back });
      return data;
    },
    onSuccess: (_, { deckId }) => {
      void queryClient.invalidateQueries({ queryKey: deckKeys.cards(deckId) });
    },
  });
};

type UpdateCardVars = { deckId: number; cardId: number; front: string; back: string };

export const useUpdateCard = (): UseMutationResult<Card, Error, UpdateCardVars> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      deckId, cardId, front, back,
    }: UpdateCardVars): Promise<Card> => {
      const { data } = await api.patch<Card>(`/decks/${deckId}/cards/${cardId}`, { front, back });
      return data;
    },
    onSuccess: (_, { deckId }) => {
      void queryClient.invalidateQueries({ queryKey: deckKeys.cards(deckId) });
    },
  });
};
