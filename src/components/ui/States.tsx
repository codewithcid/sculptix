import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { usePalette } from '@/theme';
import { Button } from './Button';
import { Text } from './Text';

/** Full-area loading spinner. */
export function LoadingState({ label }: { label?: string }) {
  const palette = usePalette();
  return (
    <View className="flex-1 items-center justify-center gap-3 py-16">
      <ActivityIndicator size="large" color={palette.primary} />
      {label ? <Text variant="caption">{label}</Text> : null}
    </View>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Friendly empty placeholder with an optional call to action. */
export function EmptyState({ icon = '✨', title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center justify-center gap-2 px-6 py-16">
      <Text className="text-5xl">{icon}</Text>
      <Text variant="heading" className="text-center">
        {title}
      </Text>
      {description ? (
        <Text variant="caption" className="text-center">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-4 w-full max-w-xs">
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <View className="items-center justify-center gap-3 px-6 py-16">
      <Text className="text-4xl">⚠️</Text>
      <Text variant="subheading" className="text-center">
        {message}
      </Text>
      {onRetry ? (
        <View className="mt-2 w-full max-w-xs">
          <Button title="Try again" variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
