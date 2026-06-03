import React from 'react';
import { View } from 'react-native';
import { getExercise } from '@/data';
import type { Exercise } from '@/types';
import { LABELS } from '@/types';
import { capitalize } from '@/utils';
import { ExerciseCard } from './ExerciseCard';
import { ExercisePlayer } from './ExercisePlayer';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { Text } from './ui/Text';

interface ExerciseDetailsProps {
  exercise: Exercise;
  onSelectAlternative?: (alt: Exercise) => void;
}

/** Full exercise breakdown: demo, muscles, instructions, mistakes, alternates. */
export function ExerciseDetails({ exercise, onSelectAlternative }: ExerciseDetailsProps) {
  const muscles = [exercise.primaryMuscle, ...exercise.secondaryMuscles];
  const alternatives = exercise.alternativeIds
    .map(getExercise)
    .filter((e): e is Exercise => !!e);

  return (
    <View className="gap-5">
      <ExercisePlayer exercise={exercise} />

      <View className="gap-1">
        <Text variant="title">{exercise.name}</Text>
        <View className="flex-row flex-wrap gap-2">
          <Badge label={capitalize(exercise.pattern)} tone="primary" />
          <Badge label={capitalize(exercise.difficulty)} tone="neutral" />
        </View>
        <Text variant="body" className="mt-1 text-text-muted">
          {exercise.description}
        </Text>
      </View>

      <Section title="Muscles Worked">
        <View className="flex-row flex-wrap gap-2">
          {muscles.map((m, i) => (
            <Badge
              key={m}
              label={LABELS.muscle[m]}
              tone={i === 0 ? 'success' : 'neutral'}
            />
          ))}
        </View>
      </Section>

      <Section title="Instructions">
        <View className="gap-2">
          {exercise.instructions.map((step, i) => (
            <View key={i} className="flex-row gap-3">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-primary/15">
                <Text className="text-xs font-bold text-primary">{i + 1}</Text>
              </View>
              <Text className="flex-1 text-text">{step}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Common Mistakes">
        <View className="gap-2">
          {exercise.commonMistakes.map((m, i) => (
            <View key={i} className="flex-row gap-2">
              <Text className="text-danger">✕</Text>
              <Text className="flex-1 text-text">{m}</Text>
            </View>
          ))}
        </View>
      </Section>

      {alternatives.length ? (
        <Section title="Alternative Exercises">
          <View className="gap-2">
            {alternatives.map((alt) => (
              <ExerciseCard
                key={alt.id}
                exercise={alt}
                onPress={() => onSelectAlternative?.(alt)}
              />
            ))}
          </View>
        </Section>
      ) : null}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <Text variant="label" className="mb-3">
        {title}
      </Text>
      {children}
    </Card>
  );
}
