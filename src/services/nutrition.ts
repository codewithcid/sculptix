/** Food search + nutrition logging. */
import { supabase } from '@/lib/supabase';
import type { DailyNutritionTotals, Food, MealType, NutritionLog } from '@/types';
import { mapFood, mapNutritionLog } from './mappers';

export async function searchFoods(query: string, limit = 30): Promise<Food[]> {
  let req = supabase.from('foods').select('*').order('name', { ascending: true }).limit(limit);
  if (query.trim()) req = req.ilike('name', `%${query.trim()}%`);
  const { data, error } = await req;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapFood);
}

export interface CustomFoodInput {
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export async function createCustomFood(userId: string, input: CustomFoodInput): Promise<Food> {
  const { data, error } = await supabase
    .from('foods')
    .insert({
      user_id: userId,
      name: input.name,
      brand: input.brand ?? null,
      serving_size: input.servingSize,
      serving_unit: input.servingUnit,
      calories: input.calories,
      protein_g: input.proteinG,
      carbs_g: input.carbsG,
      fat_g: input.fatG,
      source: 'custom',
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapFood(data);
}

export interface LogFoodInput {
  food: Food;
  servings: number;
  meal: MealType;
  date: string;
}

export async function logFood(userId: string, input: LogFoodInput): Promise<NutritionLog> {
  const { food, servings } = input;
  const { data, error } = await supabase
    .from('nutrition_logs')
    .insert({
      user_id: userId,
      food_id: food.id,
      date: input.date,
      meal: input.meal,
      name: food.name,
      servings,
      calories: round(food.calories * servings),
      protein_g: round(food.proteinG * servings),
      carbs_g: round(food.carbsG * servings),
      fat_g: round(food.fatG * servings),
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapNutritionLog(data);
}

export async function getNutritionByDate(userId: string, date: string): Promise<NutritionLog[]> {
  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapNutritionLog);
}

export async function deleteNutritionLog(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('nutrition_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export function sumTotals(logs: NutritionLog[]): DailyNutritionTotals {
  return logs.reduce<DailyNutritionTotals>(
    (acc, l) => ({
      calories: acc.calories + l.calories,
      proteinG: acc.proteinG + l.proteinG,
      carbsG: acc.carbsG + l.carbsG,
      fatG: acc.fatG + l.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}

const round = (n: number) => Math.round(n * 10) / 10;
