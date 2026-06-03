import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';
import { getExerciseGifUrl } from '@/data';
import type { Exercise } from '@/types';
import { LABELS } from '@/types';
import { Text } from './ui/Text';

interface ExercisePlayerProps {
  exercise: Exercise;
  height?: number;
  rounded?: boolean;
}

/**
 * Renders an exercise's demonstration GIF (via expo-image) with a graceful
 * placeholder when no media is configured. See getExerciseGifUrl /
 * EXPO_PUBLIC_EXERCISE_MEDIA_BASE.
 */
export function ExercisePlayer({ exercise, height = 220, rounded = true }: ExercisePlayerProps) {
  const url = getExerciseGifUrl(exercise);
  const radius = rounded ? 'rounded-2xl' : '';

  if (!url) {
    return (
      <View
        className={`items-center justify-center overflow-hidden bg-surface-elevated ${radius}`}
        style={{ height }}
      >
        <Text className="text-5xl">🏋️</Text>
        <Text variant="subheading" className="mt-2 text-center">
          {exercise.name}
        </Text>
        <Text variant="caption" className="mt-1">
          {LABELS.muscle[exercise.primaryMuscle]}
        </Text>
      </View>
    );
  }

  return (
    <View className={`overflow-hidden bg-surface-elevated ${radius}`} style={{ height }}>
      <Image
        source={{ uri: url }}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
        transition={200}
        accessibilityLabel={`${exercise.name} demonstration`}
      />
    </View>
  );
}
