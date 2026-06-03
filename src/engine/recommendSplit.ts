/**
 * Recommend a workout split from the user's constraints when they don't pick
 * one manually. Scores each split on day-count fit, experience fit, physique
 * affinity and session length, then returns the best with a rationale.
 */
import { SPLITS, getPhysiqueGoal } from '@/data';
import type { ExperienceLevel, SplitDefinition, SplitType } from '@/types';

export interface SplitRecommendation {
  splitType: SplitType;
  reason: string;
  alternatives: SplitType[];
}

interface Constraints {
  daysPerWeek: number;
  sessionDurationMin: number;
  experience: ExperienceLevel;
  physiqueGoalId: string;
}

function scoreSplit(split: SplitDefinition, c: Constraints): number {
  if (split.type === 'custom') return -Infinity; // never auto-recommend custom
  let score = 0;

  // Must support the chosen frequency (hard requirement).
  if (!split.supportedDays.includes(c.daysPerWeek)) return -Infinity;
  score += 3;

  // Experience fit.
  if (split.bestFor.includes(c.experience)) score += 3;

  // Physique template affinity.
  const physique = getPhysiqueGoal(c.physiqueGoalId);
  const rank = physique?.recommendedSplits.indexOf(split.type) ?? -1;
  if (rank === 0) score += 4;
  else if (rank === 1) score += 3;
  else if (rank > 1) score += 2;

  // Short sessions favour higher-frequency, fewer-muscle-per-day splits.
  if (c.sessionDurationMin <= 45 && (split.type === 'full_body' || split.type === 'upper_lower')) {
    score += 1;
  }
  // Bro splits need long sessions to fit the per-muscle volume.
  if (split.type === 'bro_split' && c.sessionDurationMin >= 60) score += 1;

  return score;
}

export function recommendSplit(c: Constraints): SplitRecommendation {
  const ranked = SPLITS.map((s) => ({ split: s, score: scoreSplit(s, c) }))
    .filter((r) => r.score > -Infinity)
    .sort((a, b) => b.score - a.score);

  const best = ranked[0]?.split;
  // Fallback: full body 3-day is always valid.
  if (!best) {
    return {
      splitType: 'full_body',
      reason: 'A 3-day full-body plan is a safe, effective default for your schedule.',
      alternatives: [],
    };
  }

  const physique = getPhysiqueGoal(c.physiqueGoalId);
  const reason =
    `${best.name} fits ${c.daysPerWeek} days/week for a ${c.experience} lifter` +
    (physique ? ` and complements your ${physique.name} goal.` : '.');

  return {
    splitType: best.type,
    reason,
    alternatives: ranked.slice(1, 3).map((r) => r.split.type),
  };
}
