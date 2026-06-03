import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';
import { getExerciseGifUrl } from '@/data';
import type { Exercise } from '@/types';
import { LABELS } from '@/types';
import { capitalize } from '@/utils';
import { Badge } from './ui/Badge';
import { Text } from './ui/Text';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  /** Optional prescription summary, e.g. "3 × 8–12". */
  prescription?: string;
  rightSlot?: React.ReactNode;
}

/** Compact list row for an exercise with a thumbnail and primary muscle. */
export function ExerciseCard({ exercise, onPress, prescription, rightSlot }: ExerciseCardProps) {
  const url = getExerciseGifUrl(exercise);
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3 active:opacity-80"
    >
      <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-surface-elevated">
        {url ? (
          <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Text className="text-2xl">🏋️</Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-text" numberOfLines={1}>
          {exercise.name}
        </Text>
        <View className="mt-1 flex-row items-center gap-2">
          <Text variant="caption">{LABELS.muscle[exercise.primaryMuscle]}</Text>
          <Badge label={capitalize(exercise.pattern)} tone="primary" />
        </View>
      </View>
      {prescription ? (
        <Text className="text-sm font-bold text-primary">{prescription}</Text>
      ) : null}
      {rightSlot}
    </Pressable>
  );
}
