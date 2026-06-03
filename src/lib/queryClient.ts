import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Centralised query keys so invalidation stays consistent. */
export const qk = {
  profile: ['profile'] as const,
  settings: ['settings'] as const,
  activeProgram: ['program', 'active'] as const,
  programs: ['programs'] as const,
  workouts: (filter?: string) => ['workouts', filter ?? 'all'] as const,
  workout: (id: string) => ['workout', id] as const,
  personalRecords: ['personalRecords'] as const,
  foods: (q: string) => ['foods', q] as const,
  nutritionByDate: (date: string) => ['nutrition', date] as const,
  weightEntries: ['weightEntries'] as const,
  progressPhotos: ['progressPhotos'] as const,
  analytics: ['analytics'] as const,
};
