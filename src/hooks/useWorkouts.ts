import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/lib/queryClient';
import { useAuth, useUserId } from '@/providers/AuthProvider';
import { workoutService } from '@/services';
import type { SetInput, StartWorkoutInput } from '@/services/workouts';

export function useWorkoutHistory(limit = 50) {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.workouts('history'),
    queryFn: () => workoutService.listWorkouts(user!.id, limit),
    enabled: !!user,
  });
}

export function useWorkout(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.workout(id),
    queryFn: () => workoutService.getWorkout(user!.id, id),
    enabled: !!user && !!id,
  });
}

export function usePersonalRecords() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.personalRecords,
    queryFn: () => workoutService.listPersonalRecords(user!.id),
    enabled: !!user,
  });
}

export function useStartWorkout() {
  const userId = useUserId();
  return useMutation({
    mutationFn: (input: StartWorkoutInput) => workoutService.startWorkout(userId, input),
  });
}

export function useFinishWorkout() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { workoutId: string; sets: SetInput[]; durationSeconds: number }) =>
      workoutService.finishWorkout(userId, vars.workoutId, vars.sets, vars.durationSeconds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.workouts('history') });
      qc.invalidateQueries({ queryKey: qk.personalRecords });
      qc.invalidateQueries({ queryKey: qk.analytics });
    },
  });
}
