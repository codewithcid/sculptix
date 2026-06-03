import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Text';

interface Segment<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <View className={`flex-row rounded-2xl border border-border bg-surface p-1 ${className}`}>
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <Pressable
            key={s.value}
            onPress={() => onChange(s.value)}
            className={`flex-1 items-center justify-center rounded-xl py-2 ${
              active ? 'bg-primary' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${active ? 'text-primary-foreground' : 'text-text-muted'}`}
            >
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
