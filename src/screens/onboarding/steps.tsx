/**
 * Onboarding step components. Each reads/writes the onboardingStore draft.
 * Steps are composed by OnboardingScreen. `isStepValid` gates the Next button.
 */
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Input, SelectableCard, Text } from '@/components';
import { PHYSIQUE_GOALS, SPLITS, getSplit } from '@/data';
import { recommendSplit } from '@/engine';
import { useOnboardingStore } from '@/store';
import {
  EQUIPMENT_ACCESS,
  EXPERIENCE_LEVELS,
  GENDERS,
  LABELS,
  PRIMARY_GOALS,
  type OnboardingDraft,
  type SplitType,
} from '@/types';

// Ordered step keys.
export const STEP_KEYS = [
  'basics',
  'experience',
  'equipment',
  'days',
  'duration',
  'goal',
  'physique',
  'split',
  'review',
] as const;
export type StepKey = (typeof STEP_KEYS)[number];

export const STEP_TITLES: Record<StepKey, { title: string; subtitle: string }> = {
  basics: { title: 'About you', subtitle: 'The basics help us tailor your plan.' },
  experience: { title: 'Training experience', subtitle: 'How long have you been lifting?' },
  equipment: { title: 'Equipment access', subtitle: 'What can you train with?' },
  days: { title: 'Training days', subtitle: 'How many days per week can you train?' },
  duration: { title: 'Session length', subtitle: 'How long is each workout?' },
  goal: { title: 'Primary goal', subtitle: 'What matters most right now?' },
  physique: { title: 'Dream physique', subtitle: 'Pick the look you’re training for.' },
  split: { title: 'Workout split', subtitle: 'Pick one — or let us recommend.' },
  review: { title: 'You’re all set', subtitle: 'Review and generate your program.' },
};

export function isStepValid(key: StepKey, draft: OnboardingDraft): boolean {
  switch (key) {
    case 'basics':
      return Boolean(draft.name && draft.age && draft.gender && draft.heightCm && draft.weightKg);
    case 'experience':
      return Boolean(draft.experience);
    case 'equipment':
      return Boolean(draft.equipment);
    case 'days':
      return Boolean(draft.daysPerWeek);
    case 'duration':
      return Boolean(draft.sessionDurationMin);
    case 'goal':
      return Boolean(draft.primaryGoal);
    case 'physique':
      return Boolean(draft.physiqueGoalId);
    case 'split':
      return true; // optional; undefined = recommend
    case 'review':
      return true;
    default:
      return false;
  }
}

// ── Individual steps ─────────────────────────────────────────────────────────

export function BasicsStep() {
  const { draft, update } = useOnboardingStore();
  return (
    <View className="gap-4">
      <Input
        label="Name"
        value={draft.name ?? ''}
        onChangeText={(name) => update({ name })}
        placeholder="Alex"
      />
      <View className="flex-row gap-3">
        <Input
          containerClassName="flex-1"
          label="Age"
          keyboardType="number-pad"
          value={draft.age ? String(draft.age) : ''}
          onChangeText={(t) => update({ age: t ? parseInt(t, 10) : undefined })}
          placeholder="25"
        />
        <View className="flex-1">
          <Text variant="label" className="mb-1.5">
            Gender
          </Text>
          <View className="gap-2">
            {GENDERS.map((g) => (
              <SelectableCard
                key={g}
                title={LABELS.gender[g]}
                selected={draft.gender === g}
                onPress={() => update({ gender: g })}
                className="py-2.5"
              />
            ))}
          </View>
        </View>
      </View>
      <View className="flex-row gap-3">
        <Input
          containerClassName="flex-1"
          label="Height (cm)"
          keyboardType="decimal-pad"
          value={draft.heightCm ? String(draft.heightCm) : ''}
          onChangeText={(t) => update({ heightCm: t ? parseFloat(t) : undefined })}
          placeholder="178"
        />
        <Input
          containerClassName="flex-1"
          label="Weight (kg)"
          keyboardType="decimal-pad"
          value={draft.weightKg ? String(draft.weightKg) : ''}
          onChangeText={(t) => update({ weightKg: t ? parseFloat(t) : undefined })}
          placeholder="78"
        />
      </View>
    </View>
  );
}

export function ExperienceStep() {
  const { draft, update } = useOnboardingStore();
  const subtitles: Record<string, string> = {
    beginner: 'Less than ~1 year of consistent training',
    intermediate: '1–3 years; familiar with the main lifts',
    advanced: '3+ years; progress is slow and hard-won',
  };
  return (
    <View className="gap-3">
      {EXPERIENCE_LEVELS.map((e) => (
        <SelectableCard
          key={e}
          title={LABELS.experience[e]}
          subtitle={subtitles[e]}
          selected={draft.experience === e}
          onPress={() => update({ experience: e })}
        />
      ))}
    </View>
  );
}

export function EquipmentStep() {
  const { draft, update } = useOnboardingStore();
  const subtitles: Record<string, string> = {
    full_gym: 'Barbells, machines, cables — everything',
    home_gym: 'Barbell, rack and some plates',
    dumbbells_only: 'Just a pair of adjustable dumbbells',
    bodyweight_only: 'No equipment needed',
  };
  return (
    <View className="gap-3">
      {EQUIPMENT_ACCESS.map((e) => (
        <SelectableCard
          key={e}
          title={LABELS.equipment[e]}
          subtitle={subtitles[e]}
          selected={draft.equipment === e}
          onPress={() => update({ equipment: e })}
        />
      ))}
    </View>
  );
}

export function DaysStep() {
  const { draft, update } = useOnboardingStore();
  return (
    <View className="gap-3">
      {[3, 4, 5, 6].map((d) => (
        <SelectableCard
          key={d}
          title={`${d} days per week`}
          selected={draft.daysPerWeek === d}
          onPress={() => update({ daysPerWeek: d })}
        />
      ))}
    </View>
  );
}

export function DurationStep() {
  const { draft, update } = useOnboardingStore();
  const options = [30, 45, 60, 75, 90];
  return (
    <View className="gap-3">
      {options.map((m) => (
        <SelectableCard
          key={m}
          title={m === 90 ? '90 minutes+' : `${m} minutes`}
          selected={draft.sessionDurationMin === m}
          onPress={() => update({ sessionDurationMin: m })}
        />
      ))}
    </View>
  );
}

export function GoalStep() {
  const { draft, update } = useOnboardingStore();
  const subtitles: Record<string, string> = {
    build_muscle: 'Add size through progressive overload',
    lose_fat: 'Retain muscle while dropping body fat',
    recomp: 'Build muscle and lose fat together',
    strength: 'Get stronger on the main lifts',
  };
  return (
    <View className="gap-3">
      {PRIMARY_GOALS.map((g) => (
        <SelectableCard
          key={g}
          title={LABELS.goal[g]}
          subtitle={subtitles[g]}
          selected={draft.primaryGoal === g}
          onPress={() => update({ primaryGoal: g })}
        />
      ))}
    </View>
  );
}

export function PhysiqueStep() {
  const { draft, update } = useOnboardingStore();
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="gap-3 pb-2">
        {PHYSIQUE_GOALS.map((p) => (
          <SelectableCard
            key={p.id}
            title={p.name}
            subtitle={p.tagline}
            selected={draft.physiqueGoalId === p.id}
            onPress={() => update({ physiqueGoalId: p.id })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

export function SplitStep() {
  const { draft, update } = useOnboardingStore();
  const recommendation =
    draft.daysPerWeek && draft.experience && draft.physiqueGoalId
      ? recommendSplit({
          daysPerWeek: draft.daysPerWeek,
          sessionDurationMin: draft.sessionDurationMin ?? 60,
          experience: draft.experience,
          physiqueGoalId: draft.physiqueGoalId,
        })
      : null;

  const usable = SPLITS.filter(
    (s) => s.type === 'custom' || (draft.daysPerWeek ? s.supportedDays.includes(draft.daysPerWeek) : true),
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="gap-3 pb-2">
        {recommendation ? (
          <SelectableCard
            title={`Recommended: ${getSplit(recommendation.splitType).name}`}
            subtitle={recommendation.reason}
            selected={draft.splitType === undefined || draft.splitType === recommendation.splitType}
            onPress={() => update({ splitType: recommendation.splitType })}
          />
        ) : null}
        {usable.map((s) => (
          <SelectableCard
            key={s.type}
            title={s.name}
            subtitle={s.description}
            selected={draft.splitType === s.type}
            onPress={() => update({ splitType: s.type as SplitType })}
          />
        ))}
      </View>
    </ScrollView>
  );
}
