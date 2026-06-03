import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Text';

interface SelectableCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}

/** Tappable option tile used across onboarding and pickers. */
export function SelectableCard({
  title,
  subtitle,
  selected,
  onPress,
  leftSlot,
  rightSlot,
  className = '',
}: SelectableCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-2xl border p-4 active:opacity-80 ${
        selected ? 'border-primary bg-primary/10' : 'border-border bg-surface'
      } ${className}`}
    >
      {leftSlot}
      <View className="flex-1">
        <Text className={`text-base font-semibold ${selected ? 'text-primary' : 'text-text'}`}>
          {title}
        </Text>
        {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      </View>
      {rightSlot ?? (
        <View
          className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
            selected ? 'border-primary bg-primary' : 'border-border'
          }`}
        >
          {selected ? <View className="h-2 w-2 rounded-full bg-primary-foreground" /> : null}
        </View>
      )}
    </Pressable>
  );
}
