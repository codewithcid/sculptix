import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, SegmentedControl, Text } from '@/components';
import { useSettings, useUpdateProfile, useUpdateSettings } from '@/hooks';
import { authService } from '@/services';
import { useTheme } from '@/theme';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export function SettingsScreen(_props: Props) {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const updateProfile = useUpdateProfile();
  const { preference, setPreference } = useTheme();
  const [deleting, setDeleting] = useState(false);

  const unit = settings?.unitSystem ?? 'metric';
  const restDefault = settings?.restTimerDefaultSeconds ?? 90;
  const notifications = settings?.notificationsEnabled ?? true;

  const confirmDelete = () => {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account and all your data — programs, workouts, ' +
        'nutrition logs, weight history and progress photos. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await authService.deleteAccount();
              // Auth state change routes back to the welcome screen.
            } catch (e) {
              setDeleting(false);
              Alert.alert('Could not delete account', e instanceof Error ? e.message : 'Try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <Text variant="title" className="py-4">
          Settings
        </Text>

        <Card className="mb-4 gap-3">
          <Text variant="label">Appearance</Text>
          <SegmentedControl
            segments={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            value={preference}
            onChange={(t) => {
              setPreference(t as 'system' | 'light' | 'dark');
              updateSettings.mutate({ theme: t as 'system' | 'light' | 'dark' });
            }}
          />
        </Card>

        <Card className="mb-4 gap-3">
          <Text variant="label">Units</Text>
          <SegmentedControl
            segments={[
              { value: 'metric', label: 'Metric (kg/cm)' },
              { value: 'imperial', label: 'Imperial (lb)' },
            ]}
            value={unit}
            onChange={(u) => {
              const unitSystem = u as 'metric' | 'imperial';
              updateSettings.mutate({ unitSystem });
              updateProfile.mutate({ unitSystem });
            }}
          />
        </Card>

        <Card className="mb-4 gap-3">
          <Text variant="label">Default rest timer</Text>
          <SegmentedControl
            segments={[
              { value: '60', label: '60s' },
              { value: '90', label: '90s' },
              { value: '120', label: '120s' },
              { value: '180', label: '180s' },
            ]}
            value={String(restDefault)}
            onChange={(s) => updateSettings.mutate({ restTimerDefaultSeconds: parseInt(s, 10) })}
          />
        </Card>

        <Card className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text variant="subheading">Notifications</Text>
            <Text variant="caption">Workout & logging reminders</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={(v) => updateSettings.mutate({ notificationsEnabled: v })}
          />
        </Card>

        <Button title="Sign out" variant="secondary" onPress={() => authService.signOut()} />

        <Card className="mt-6 gap-3">
          <Text variant="label">Danger zone</Text>
          <Text variant="caption">
            Deleting your account permanently removes all of your data. This action is
            irreversible.
          </Text>
          <Button
            title="Delete account"
            variant="danger"
            loading={deleting}
            onPress={confirmDelete}
          />
        </Card>

        <Text variant="caption" className="mt-6 text-center">
          Sculptix · v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
