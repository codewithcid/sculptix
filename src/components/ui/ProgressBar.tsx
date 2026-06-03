import React from 'react';
import { View } from 'react-native';

interface ProgressBarProps {
  /** 0..1 */
  progress: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
}

export function ProgressBar({
  progress,
  className = '',
  trackClassName = 'bg-border',
  barClassName = 'bg-primary',
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View className={`h-2 w-full overflow-hidden rounded-full ${trackClassName} ${className}`}>
      <View className={`h-full rounded-full ${barClassName}`} style={{ width: `${pct}%` }} />
    </View>
  );
}
