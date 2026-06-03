import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/lib/queryClient';
import { useAuth, useUserId } from '@/providers/AuthProvider';
import { nutritionService } from '@/services';
import type { CustomFoodInput, LogFoodInput } from '@/services/nutrition';

export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: qk.foods(query),
    queryFn: () => nutritionService.searchFoods(query),
    staleTime: 1000 * 60 * 5,
  });
}

export function useNutritionByDate(date: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.nutritionByDate(date),
    queryFn: () => nutritionService.getNutritionByDate(user!.id, date),
    enabled: !!user,
  });
}

export function useLogFood(date: string) {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LogFoodInput) => nutritionService.logFood(userId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.nutritionByDate(date) });
      qc.invalidateQueries({ queryKey: qk.analytics });
    },
  });
}

export function useCreateFood() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomFoodInput) => nutritionService.createCustomFood(userId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foods'] }),
  });
}

export function useDeleteNutritionLog(date: string) {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => nutritionService.deleteNutritionLog(userId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.nutritionByDate(date) }),
  });
}
