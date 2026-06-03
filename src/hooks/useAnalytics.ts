import { useMemo } from 'react';
import { calcMacroTargets, type NutritionInput } from '@/engine';
import {
  computeWeightTrend,
  computeWorkoutStats,
  volumeByDay,
} from '@/utils/analytics';
import { useProfile } from './useProfile';
import { useWeightEntries } from './useWeight';
import { useWorkoutHistory } from './useWorkouts';

/** Aggregated dashboard analytics derived from the user's logged data. */
export function useAnalytics() {
  const workoutsQ = useWorkoutHistory(200);
  const weightQ = useWeightEntries();

  const workoutStats = useMemo(
    () => computeWorkoutStats(workoutsQ.data ?? []),
    [workoutsQ.data],
  );
  const weightTrend = useMemo(
    () => computeWeightTrend(weightQ.data ?? []),
    [weightQ.data],
  );
  const volumeSeries = useMemo(
    () => volumeByDay(workoutsQ.data ?? [], 7),
    [workoutsQ.data],
  );

  return {
    isLoading: workoutsQ.isLoading || weightQ.isLoading,
    workoutStats,
    weightTrend,
    volumeSeries,
  };
}

/** Macro targets derived from the user's profile, or null if data is missing. */
export function useMacroTargets() {
  const { data: profile } = useProfile();
  return useMemo(() => {
    if (!profile) return null;
    if (
      profile.weightKg == null ||
      profile.heightCm == null ||
      profile.age == null ||
      profile.gender == null ||
      profile.primaryGoal == null ||
      profile.daysPerWeek == null
    ) {
      return null;
    }
    const input: NutritionInput = {
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      age: profile.age,
      gender: profile.gender,
      goal: profile.primaryGoal,
      daysPerWeek: profile.daysPerWeek,
    };
    return calcMacroTargets(input);
  }, [profile]);
}
