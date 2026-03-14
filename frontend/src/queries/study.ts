import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { MyDeck, StudyCard } from '@/types';

export const studyKeys = {
  myDecks: ['study', 'my-decks'] as const,
  next: (deckId: number) => ['study', deckId, 'next'] as const,
};

export function useMyDecks() {
  return useQuery({
    queryKey: studyKeys.myDecks,
    queryFn: async () => {
      const { data } = await api.get<MyDeck[]>('/study/my-decks');
      return data;
    },
  });
}

export function useNextCard(deckId: number) {
  return useQuery({
    queryKey: studyKeys.next(deckId),
    queryFn: async () => {
      const { data } = await api.get<StudyCard | null>(`/study/${deckId}/next`);
      return data;
    },
    enabled: !!deckId,
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deckId: number) => {
      await api.post(`/study/${deckId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyKeys.myDecks });
    },
  });
}

export function useReviewCard() {
  return useMutation({
    mutationFn: async ({ deckId, cardId, rating }: { deckId: number; cardId: number; rating: number }) => {
      const { data } = await api.post<StudyCard | null>(`/study/${deckId}/cards/${cardId}/review`, { rating });
      return data;
    },
  });
}
