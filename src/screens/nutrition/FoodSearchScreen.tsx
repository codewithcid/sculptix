import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  EmptyState,
  Input,
  LoadingState,
  SegmentedControl,
  Text,
} from '@/components';
import { useFoodSearch, useLogFood } from '@/hooks';
import type { Food, MealType } from '@/types';
import { MEAL_TYPES } from '@/types';
import type { NutritionStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<NutritionStackParamList, 'FoodSearch'>;

export function FoodSearchScreen({ route, navigation }: Props) {
  const { date } = route.params;
  const [query, setQuery] = useState('');
  const [meal, setMeal] = useState<MealType>((route.params.meal as MealType) ?? 'breakfast');
  const [selected, setSelected] = useState<Food | null>(null);
  const [servings, setServings] = useState('1');

  const { data: foods, isLoading } = useFoodSearch(query);
  const logFood = useLogFood(date);

  const onLog = async () => {
    if (!selected) return;
    const s = parseFloat(servings) || 1;
    await logFood.mutateAsync({ food: selected, servings: s, meal, date });
    setSelected(null);
    setServings('1');
    navigation.goBack();
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="gap-3 px-5 pt-3">
        <Text variant="title">Add food</Text>
        <SegmentedControl
          segments={MEAL_TYPES.map((m) => ({ value: m, label: m[0]!.toUpperCase() + m.slice(1) }))}
          value={meal}
          onChange={setMeal}
        />
        <Input placeholder="Search foods…" value={query} onChangeText={setQuery} autoFocus />
      </View>

      {isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={foods ?? []}
          keyExtractor={(f) => f.id}
          contentContainerStyle={{ padding: 20, gap: 8 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Card onPress={() => setSelected(item)}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-text" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text variant="caption">
                    {item.servingSize}
                    {item.servingUnit} · {Math.round(item.calories)} kcal · P
                    {Math.round(item.proteinG)} C{Math.round(item.carbsG)} F{Math.round(item.fatG)}
                  </Text>
                </View>
                <Text className="text-2xl text-primary">＋</Text>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="🍽️"
              title="No foods found"
              description="Create a custom food to log it."
              actionLabel="Create custom food"
              onAction={() => navigation.navigate('CreateFood', { date, meal })}
            />
          }
          ListFooterComponent={
            (foods?.length ?? 0) > 0 ? (
              <Button
                title="Create custom food"
                variant="ghost"
                onPress={() => navigation.navigate('CreateFood', { date, meal })}
              />
            ) : null
          }
        />
      )}

      {/* Servings modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <Pressable
          className="flex-1 justify-end bg-black/60"
          onPress={() => setSelected(null)}
        >
          <Pressable className="rounded-t-3xl bg-surface p-6" onPress={(e) => e.stopPropagation()}>
            {selected ? (
              <View className="gap-4">
                <Text variant="heading">{selected.name}</Text>
                <Text variant="caption">
                  Per serving ({selected.servingSize}
                  {selected.servingUnit}): {Math.round(selected.calories)} kcal
                </Text>
                <Input
                  label="Servings"
                  keyboardType="decimal-pad"
                  value={servings}
                  onChangeText={setServings}
                />
                <View className="flex-row gap-3">
                  <View className="flex-1 items-center">
                    <Text variant="label">Calories</Text>
                    <Text variant="subheading">
                      {Math.round(selected.calories * (parseFloat(servings) || 0))}
                    </Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text variant="label">Protein</Text>
                    <Text variant="subheading">
                      {Math.round(selected.proteinG * (parseFloat(servings) || 0))}g
                    </Text>
                  </View>
                </View>
                <Button title="Add to log" onPress={onLog} loading={logFood.isPending} />
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
