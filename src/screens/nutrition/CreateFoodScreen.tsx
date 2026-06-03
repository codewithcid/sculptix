import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Text } from '@/components';
import { useCreateFood, useLogFood } from '@/hooks';
import type { MealType } from '@/types';
import type { NutritionStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<NutritionStackParamList, 'CreateFood'>;

export function CreateFoodScreen({ route, navigation }: Props) {
  const date = route.params?.date;
  const meal = (route.params?.meal as MealType) ?? 'snack';
  const createFood = useCreateFood();
  const logFood = useLogFood(date ?? '');

  const [name, setName] = useState('');
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSave = async (alsoLog: boolean) => {
    setError(null);
    if (!name.trim() || !calories) {
      setError('Name and calories are required.');
      return;
    }
    try {
      const food = await createFood.mutateAsync({
        name: name.trim(),
        servingSize: parseFloat(servingSize) || 100,
        servingUnit: servingUnit || 'g',
        calories: parseFloat(calories) || 0,
        proteinG: parseFloat(protein) || 0,
        carbsG: parseFloat(carbs) || 0,
        fatG: parseFloat(fat) || 0,
      });
      if (alsoLog && date) {
        await logFood.mutateAsync({ food, servings: 1, meal, date });
      }
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save food');
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10 gap-4" keyboardShouldPersistTaps="handled">
        <Text variant="title" className="py-2">
          Custom food
        </Text>
        <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Protein bar" />
        <View className="flex-row gap-3">
          <Input
            containerClassName="flex-1"
            label="Serving size"
            keyboardType="decimal-pad"
            value={servingSize}
            onChangeText={setServingSize}
          />
          <Input
            containerClassName="w-24"
            label="Unit"
            value={servingUnit}
            onChangeText={setServingUnit}
          />
        </View>
        <Input
          label="Calories (per serving)"
          keyboardType="decimal-pad"
          value={calories}
          onChangeText={setCalories}
          placeholder="0"
        />
        <View className="flex-row gap-3">
          <Input
            containerClassName="flex-1"
            label="Protein (g)"
            keyboardType="decimal-pad"
            value={protein}
            onChangeText={setProtein}
          />
          <Input
            containerClassName="flex-1"
            label="Carbs (g)"
            keyboardType="decimal-pad"
            value={carbs}
            onChangeText={setCarbs}
          />
          <Input
            containerClassName="flex-1"
            label="Fat (g)"
            keyboardType="decimal-pad"
            value={fat}
            onChangeText={setFat}
          />
        </View>

        {error ? <Text className="text-sm text-danger">{error}</Text> : null}

        {date ? (
          <Button
            title="Save & log to today"
            onPress={() => onSave(true)}
            loading={createFood.isPending || logFood.isPending}
          />
        ) : null}
        <Button
          title="Save to my foods"
          variant={date ? 'secondary' : 'primary'}
          onPress={() => onSave(false)}
          loading={createFood.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
