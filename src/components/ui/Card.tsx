import React from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  onPress?: () => void;
  /** Slightly raised surface tone. */
  elevated?: boolean;
  className?: string;
}

export function Card({ onPress, elevated, className = '', children, ...rest }: CardProps) {
  const classes = `rounded-2xl border border-border p-4 ${
    elevated ? 'bg-surface-elevated' : 'bg-surface'
  } ${className}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${classes} active:opacity-80`}>
        {children}
      </Pressable>
    );
  }
  return (
    <View className={classes} {...rest}>
      {children}
    </View>
  );
}
