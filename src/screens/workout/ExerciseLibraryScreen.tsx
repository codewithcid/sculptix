import { FlashList } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ExerciseCard, Input, Text } from '@/components';
import { EXERCISES } from '@/data';
import { LABELS, MUSCLE_GROUPS, type MuscleGroup } from '@/types';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'ExerciseLibrary'>;

export function ExerciseLibraryScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      const matchesMuscle =
        muscle === 'all' || e.primaryMuscle === muscle || e.secondaryMuscles.includes(muscle);
      const matchesQuery = !q || e.name.toLowerCase().includes(q);
      return matchesMuscle && matchesQuery;
    });
  }, [query, muscle]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="gap-3 px-5 pb-2 pt-3">
        <Text variant="title">Exercises</Text>
        <Input placeholder="Search exercises…" value={query} onChangeText={setQuery} />
        <FlashList
          horizontal
          data={['all', ...MUSCLE_GROUPS] as (MuscleGroup | 'all')[]}
          keyExtractor={(m) => m}
          estimatedItemSize={80}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const active = item === muscle;
            return (
              <Pressable
                onPress={() => setMuscle(item)}
                className={`mr-2 rounded-full border px-3 py-1.5 ${
                  active ? 'border-primary bg-primary' : 'border-border bg-surface'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${active ? 'text-primary-foreground' : 'text-text-muted'}`}
                >
                  {item === 'all' ? 'All' : LABELS.muscle[item]}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlashList
        data={filtered}
        keyExtractor={(e) => e.id}
        estimatedItemSize={76}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
          />
        )}
        ListEmptyComponent={<EmptyState icon="🔍" title="No exercises found" />}
      />
    </SafeAreaView>
  );
}
