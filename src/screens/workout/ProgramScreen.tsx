import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingState,
  Text,
} from '@/components';
import { getPhysiqueGoal } from '@/data';
import { useActiveProgram, useProfile } from '@/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatReps } from '@/utils';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'Program'>;

export function ProgramScreen({ navigation }: Props) {
  const { data: program, isLoading } = useActiveProgram();
  const { data: profile } = useProfile();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (!program) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <EmptyState
          icon="📋"
          title="No program yet"
          description="Finish onboarding to generate your personalised training program."
        />
      </SafeAreaView>
    );
  }

  const physique = getPhysiqueGoal(program.physiqueGoalId);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-1">
            <Text variant="title">{program.name}</Text>
            <Text variant="caption">
              {program.daysPerWeek} days/week · {program.sessionDurationMin} min
            </Text>
          </View>
          <Button
            title="History"
            variant="ghost"
            fullWidth={false}
            onPress={() => navigation.navigate('WorkoutHistory')}
          />
        </View>

        {physique ? (
          <Card className="mb-4 gap-1">
            <Text variant="label">Goal</Text>
            <Text variant="subheading">{physique.name}</Text>
            <Text variant="caption">{physique.description}</Text>
          </Card>
        ) : null}

        <View className="gap-4">
          {program.days.map((day) => (
            <Card key={day.dayIndex} elevated className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text variant="heading">{day.name}</Text>
                  <Text variant="caption">{day.focus}</Text>
                </View>
                <Badge label={`Day ${day.dayIndex + 1}`} tone="primary" />
              </View>

              <View className="gap-2">
                {day.exercises.map((ex, i) => (
                  <View
                    key={`${ex.exerciseId}-${i}`}
                    className="flex-row items-center justify-between"
                  >
                    <Text className="flex-1 text-text" numberOfLines={1}>
                      {ex.exerciseName}
                    </Text>
                    <Text variant="caption" className="font-semibold">
                      {ex.sets} × {formatReps(ex.repRange)}
                    </Text>
                  </View>
                ))}
              </View>

              <Button
                title="Start this workout"
                className="mt-1"
                onPress={() =>
                  navigation.navigate('ActiveWorkout', { programDayIndex: day.dayIndex })
                }
              />
            </Card>
          ))}
        </View>

        {program.progressionStrategy ? (
          <Card className="mt-5 gap-2">
            <Text variant="label">Progression strategy</Text>
            <Text variant="body" className="text-text-muted">
              {program.progressionStrategy}
            </Text>
          </Card>
        ) : null}

        <Text variant="caption" className="mt-6 text-center">
          {profile?.splitType ? '' : ''}Want a different plan? Re-run onboarding from Settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
