import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Button, Card, Divider, Text } from '@/components';
import { getPhysiqueGoal } from '@/data';
import { useProfile } from '@/hooks';
import { authService } from '@/services';
import { LABELS } from '@/types';
import { displayHeight, displayWeight, initials } from '@/utils';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { data: profile } = useProfile();
  const unit = profile?.unitSystem ?? 'metric';
  const physique = getPhysiqueGoal(profile?.physiqueGoalId);

  const rows: { label: string; value: string }[] = [
    { label: 'Age', value: profile?.age ? `${profile.age}` : '—' },
    { label: 'Gender', value: profile?.gender ? LABELS.gender[profile.gender] : '—' },
    { label: 'Height', value: displayHeight(profile?.heightCm, unit) },
    { label: 'Weight', value: displayWeight(profile?.weightKg, unit) },
    {
      label: 'Experience',
      value: profile?.experience ? LABELS.experience[profile.experience] : '—',
    },
    { label: 'Equipment', value: profile?.equipment ? LABELS.equipment[profile.equipment] : '—' },
    { label: 'Goal', value: profile?.primaryGoal ? LABELS.goal[profile.primaryGoal] : '—' },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="items-center gap-3 py-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary">
            <Text className="text-2xl font-extrabold text-primary-foreground">
              {initials(profile?.name)}
            </Text>
          </View>
          <Text variant="title">{profile?.name ?? 'Athlete'}</Text>
          {physique ? <Badge label={physique.name} tone="primary" /> : null}
        </View>

        <Card className="gap-2">
          {rows.map((r, i) => (
            <View key={r.label}>
              <View className="flex-row items-center justify-between py-1.5">
                <Text variant="caption">{r.label}</Text>
                <Text className="font-semibold text-text">{r.value}</Text>
              </View>
              {i < rows.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </Card>

        <View className="mt-5 gap-3">
          <Button title="Analytics" variant="secondary" onPress={() => navigation.navigate('Analytics')} />
          <Button title="Settings" variant="secondary" onPress={() => navigation.navigate('Settings')} />
          <Button title="Sign out" variant="danger" onPress={() => authService.signOut()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
