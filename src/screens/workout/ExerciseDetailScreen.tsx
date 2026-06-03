import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ExerciseDetails } from '@/components';
import { getExercise } from '@/data';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'ExerciseDetail'>;

export function ExerciseDetailScreen({ route, navigation }: Props) {
  const exercise = getExercise(route.params.exerciseId);

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <EmptyState icon="❓" title="Exercise not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 py-4" showsVerticalScrollIndicator={false}>
        <ExerciseDetails
          exercise={exercise}
          onSelectAlternative={(alt) =>
            navigation.push('ExerciseDetail', { exerciseId: alt.id })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
