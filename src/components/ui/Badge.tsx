import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const TONE: Record<Tone, string> = {
  neutral: 'bg-border',
  primary: 'bg-primary/15',
  success: 'bg-success/15',
  warning: 'bg-warning/15',
  danger: 'bg-danger/15',
};

const TEXT_TONE: Record<Tone, string> = {
  neutral: 'text-text-muted',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export function Badge({
  label,
  tone = 'neutral',
  className = '',
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${TONE[tone]} ${className}`}>
      <Text className={`text-xs font-semibold ${TEXT_TONE[tone]}`}>{label}</Text>
    </View>
  );
}
