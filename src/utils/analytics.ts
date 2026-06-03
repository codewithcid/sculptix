/** Pure analytics derivations over logged data. No I/O. */
import type { WeightEntry, Workout } from '@/types';
import { daysAgoIso, todayIso } from './date';

export interface WorkoutStats {
  totalWorkouts: number;
  workoutsLast7: number;
  workoutsLast30: number;
  volumeLast7: number;
  volumeLast30: number;
  currentStreakWeeks: number;
}

export function computeWorkoutStats(workouts: Workout[]): WorkoutStats {
  const completed = workouts.filter((w) => w.status === 'completed');
  const since7 = daysAgoIso(7);
  const since30 = daysAgoIso(30);

  const inLast = (since: string) => completed.filter((w) => w.date >= since);
  const sumVol = (ws: Workout[]) => ws.reduce((s, w) => s + (w.totalVolume ?? 0), 0);

  return {
    totalWorkouts: completed.length,
    workoutsLast7: inLast(since7).length,
    workoutsLast30: inLast(since30).length,
    volumeLast7: sumVol(inLast(since7)),
    volumeLast30: sumVol(inLast(since30)),
    currentStreakWeeks: computeWeeklyStreak(completed),
  };
}

/** Count consecutive prior weeks (incl. this one) with ≥1 completed workout. */
export function computeWeeklyStreak(completed: Workout[]): number {
  if (completed.length === 0) return 0;
  const weeks = new Set<number>();
  for (const w of completed) {
    weeks.add(weekIndex(w.date));
  }
  let streak = 0;
  let cursor = weekIndex(todayIso());
  while (weeks.has(cursor)) {
    streak++;
    cursor--;
  }
  return streak;
}

function weekIndex(iso: string): number {
  const d = new Date(`${iso}T00:00:00`);
  // Days since epoch / 7, Monday-aligned enough for streak purposes.
  return Math.floor((d.getTime() / 86400000 + 3) / 7);
}

export interface WeightTrend {
  latest: number | null;
  change7: number | null;
  change30: number | null;
  series: { date: string; weightKg: number }[];
}

export function computeWeightTrend(entries: WeightEntry[]): WeightTrend {
  if (entries.length === 0) return { latest: null, change7: null, change30: null, series: [] };
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1]!.weightKg;

  const valueOnOrBefore = (iso: string): number | null => {
    let result: number | null = null;
    for (const e of sorted) {
      if (e.date <= iso) result = e.weightKg;
    }
    return result;
  };

  const past7 = valueOnOrBefore(daysAgoIso(7));
  const past30 = valueOnOrBefore(daysAgoIso(30));

  return {
    latest,
    change7: past7 == null ? null : round(latest - past7),
    change30: past30 == null ? null : round(latest - past30),
    series: sorted.map((e) => ({ date: e.date, weightKg: e.weightKg })),
  };
}

/** Build a 7-day series of total training volume for a bar chart. */
export function volumeByDay(workouts: Workout[], days = 7): { date: string; volume: number }[] {
  const result: { date: string; volume: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgoIso(i);
    const volume = workouts
      .filter((w) => w.status === 'completed' && w.date === date)
      .reduce((s, w) => s + (w.totalVolume ?? 0), 0);
    result.push({ date, volume });
  }
  return result;
}

const round = (n: number) => Math.round(n * 10) / 10;
