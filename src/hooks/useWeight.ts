import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/lib/queryClient';
import { useAuth, useUserId } from '@/providers/AuthProvider';
import { weightService } from '@/services';
import type { LogWeightInput } from '@/services/weight';

export function useWeightEntries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.weightEntries,
    queryFn: () => weightService.listWeightEntries(user!.id),
    enabled: !!user,
  });
}

export function useLogWeight() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LogWeightInput) => weightService.logWeight(userId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.weightEntries });
      qc.invalidateQueries({ queryKey: qk.analytics });
    },
  });
}

export function useDeleteWeightEntry() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => weightService.deleteWeightEntry(userId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.weightEntries }),
  });
}
