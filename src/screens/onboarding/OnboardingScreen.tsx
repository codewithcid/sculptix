import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  ProgressBar,
  Screen,
  Text,
} from '@/components';
import { getPhysiqueGoal, getSplit } from '@/data';
import { recommendSplit } from '@/engine';
import { useCompleteOnboarding, useGenerateProgram } from '@/hooks';
import { useOnboardingStore } from '@/store';
import { LABELS, type ProgramGenerationInput } from '@/types';
import {
  BasicsStep,
  DaysStep,
  DurationStep,
  EquipmentStep,
  ExperienceStep,
  GoalStep,
  PhysiqueStep,
  SplitStep,
  STEP_KEYS,
  STEP_TITLES,
  isStepValid,
  type StepKey,
} from './steps';

const STEP_COMPONENTS: Record<StepKey, React.ComponentType> = {
  basics: BasicsStep,
  experience: ExperienceStep,
  equipment: EquipmentStep,
  days: DaysStep,
  duration: DurationStep,
  goal: GoalStep,
  physique: PhysiqueStep,
  split: SplitStep,
  review: ReviewStep,
};

export function OnboardingScreen() {
  const { step, draft, next, back, setStep, reset } = useOnboardingStore();
  const completeOnboarding = useCompleteOnboarding();
  const generateProgram = useGenerateProgram();
  const [error, setError] = useState<string | null>(null);

  const total = STEP_KEYS.length;
  const key = STEP_KEYS[Math.min(step, total - 1)]!;
  const StepComponent = STEP_COMPONENTS[key];
  const meta = STEP_TITLES[key];
  const isLast = key === 'review';
  const canAdvance = isStepValid(key, draft);
  const busy = completeOnboarding.isPending || generateProgram.isPending;

  const onGenerate = async () => {
    setError(null);
    try {
      const splitType =
        draft.splitType ??
        recommendSplit({
          daysPerWeek: draft.daysPerWeek!,
          sessionDurationMin: draft.sessionDurationMin ?? 60,
          experience: draft.experience!,
          physiqueGoalId: draft.physiqueGoalId!,
        }).splitType;

      const finalDraft = { ...draft, splitType };
      await completeOnboarding.mutateAsync(finalDraft);

      const input: ProgramGenerationInput = {
        physiqueGoalId: draft.physiqueGoalId!,
        splitType,
        daysPerWeek: draft.daysPerWeek!,
        sessionDurationMin: draft.sessionDurationMin!,
        experience: draft.experience!,
        equipment: draft.equipment!,
        primaryGoal: draft.primaryGoal!,
      };
      await generateProgram.mutateAsync(input);
      reset();
      // RootNavigator switches to the app once the profile is marked complete.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your program');
    }
  };

  return (
    <Screen edges={['top', 'bottom']} contentClassName="pt-2">
      <View className="gap-2 pb-4">
        <ProgressBar progress={(step + 1) / total} />
        <Text variant="caption">
          Step {step + 1} of {total}
        </Text>
        <Text variant="title">{meta.title}</Text>
        <Text variant="caption">{meta.subtitle}</Text>
      </View>

      <View className="flex-1">
        <StepComponent />
      </View>

      {error ? <Text className="mb-2 text-sm text-danger">{error}</Text> : null}

      <View className="flex-row gap-3 pt-3">
        {step > 0 ? (
          <Button title="Back" variant="secondary" fullWidth={false} onPress={back} className="px-8" />
        ) : null}
        {isLast ? (
          <Button
            title="Generate my program"
            onPress={onGenerate}
            loading={busy}
            className="flex-1"
          />
        ) : (
          <Button
            title="Continue"
            onPress={() => (canAdvance ? next() : setStep(step))}
            disabled={!canAdvance}
            className="flex-1"
          />
        )}
      </View>
    </Screen>
  );
}

function ReviewStep() {
  const { draft } = useOnboardingStore();
  const physique = getPhysiqueGoal(draft.physiqueGoalId);
  const splitName = draft.splitType ? getSplit(draft.splitType).name : 'Recommended for you';

  const rows: { label: string; value: string }[] = [
    { label: 'Physique', value: physique?.name ?? '—' },
    { label: 'Split', value: splitName },
    { label: 'Goal', value: draft.primaryGoal ? LABELS.goal[draft.primaryGoal] : '—' },
    { label: 'Experience', value: draft.experience ? LABELS.experience[draft.experience] : '—' },
    { label: 'Equipment', value: draft.equipment ? LABELS.equipment[draft.equipment] : '—' },
    { label: 'Frequency', value: `${draft.daysPerWeek ?? '—'} days / week` },
    { label: 'Session', value: `${draft.sessionDurationMin ?? '—'} min` },
  ];

  return (
    <Card elevated className="gap-3">
      {rows.map((r, i) => (
        <View key={r.label}>
          <View className="flex-row items-center justify-between py-1">
            <Text variant="caption">{r.label}</Text>
            <Text className="font-semibold text-text">{r.value}</Text>
          </View>
          {i < rows.length - 1 ? <Divider /> : null}
        </View>
      ))}
    </Card>
  );
}
