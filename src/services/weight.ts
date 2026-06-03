/** Body-weight logging. One entry per day (upsert on date). */
import { supabase } from '@/lib/supabase';
import type { WeightEntry } from '@/types';
import { todayIso } from '@/utils/date';
import { mapWeightEntry } from './mappers';

export interface LogWeightInput {
  weightKg: number;
  date?: string;
  bodyFatPct?: number | null;
  notes?: string | null;
}

export async function logWeight(userId: string, input: LogWeightInput): Promise<WeightEntry> {
  const { data, error } = await supabase
    .from('weight_entries')
    .upsert(
      {
        user_id: userId,
        date: input.date ?? todayIso(),
        weight_kg: input.weightKg,
        body_fat_pct: input.bodyFatPct ?? null,
        notes: input.notes ?? null,
      },
      { onConflict: 'user_id,date' },
    )
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapWeightEntry(data);
}

export async function listWeightEntries(userId: string, limit = 365): Promise<WeightEntry[]> {
  const { data, error } = await supabase
    .from('weight_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapWeightEntry);
}

export async function deleteWeightEntry(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('weight_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}
