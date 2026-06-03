import React from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { usePalette } from '@/theme';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  rightSlot?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  rightSlot,
  containerClassName = '',
  className = '',
  ...rest
}: InputProps) {
  const palette = usePalette();
  return (
    <View className={`gap-1.5 ${containerClassName}`}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View
        className={`flex-row items-center rounded-2xl border bg-surface px-4 ${
          error ? 'border-danger' : 'border-border'
        }`}
      >
        <TextInput
          placeholderTextColor={palette.textMuted}
          className={`h-12 flex-1 text-base text-text ${className}`}
          {...rest}
        />
        {rightSlot}
      </View>
      {error ? (
        <Text className="text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
}
