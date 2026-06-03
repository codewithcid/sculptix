import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generateProgram } from '@/engine';
import { qk } from '@/lib/queryClient';
import { useAuth, useUserId } from '@/providers/AuthProvider';
import { programService } from '@/services';
import type { ProgramGenerationInput } from '@/types';

export function useActiveProgram() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.activeProgram,
    queryFn: () => programService.getActiveProgram(user!.id),
    enabled: !!user,
  });
}

/** Generate a program from inputs and persist it as the active program. */
export function useGenerateProgram() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProgramGenerationInput) => {
      const program = generateProgram(input, userId);
      return programService.saveProgram(userId, program);
    },
    onSuccess: (program) => {
      qc.setQueryData(qk.activeProgram, program);
      qc.invalidateQueries({ queryKey: qk.programs });
    },
  });
}
