import {
  useQuery, useMutation, useQueryClient,
  type UseQueryResult, type UseMutationResult,
} from '@tanstack/react-query';
import api from '@/lib/api';
import type { MyDeck, StudyCard } from '@/types';

export const studyKeys = {
  myDecks: ['study', 'my-decks'] as const,
  next: (deckId: number) => ['study', deckId, 'next'] as const,
};

export const useMyDecks = (): UseQueryResult<MyDeck[]> => useQuery({
  queryKey: studyKeys.myDecks,
  queryFn: async (): Promise<MyDeck[]> => {
    const { data } = await api.get<MyDeck[]>('/study/my-decks');
    return data;
  },
});

export const useNextCard = (deckId: number): UseQueryResult<StudyCard | null> => useQuery({
  queryKey: studyKeys.next(deckId),
  queryFn: async (): Promise<StudyCard | null> => {
    const { data } = await api.get<StudyCard | null>(`/study/${deckId}/next`);
    return data;
  },
  enabled: !!deckId,
});

export const useEnroll = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deckId: number): Promise<void> => {
      await api.post(`/study/${deckId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studyKeys.myDecks });
    },
  });
};

type ReviewCardVars = { deckId: number; cardId: number; rating: number };
type ReviewCardResult = UseMutationResult<StudyCard | null, Error, ReviewCardVars>;

export const useReviewCard = (): ReviewCardResult => useMutation({
  mutationFn: async ({ deckId, cardId, rating }: ReviewCardVars): Promise<StudyCard | null> => {
    const { data } = await api.post<StudyCard | null>(
      `/study/${deckId}/cards/${cardId}/review`,
      { rating },
    );
    return data;
  },
});
