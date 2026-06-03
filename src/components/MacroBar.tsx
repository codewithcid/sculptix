import React from 'react';
import { View } from 'react-native';
import { ProgressBar } from './ui/ProgressBar';
import { Text } from './ui/Text';

interface MacroBarProps {
  label: string;
  value: number;
  target?: number;
  color: string; // raw rgb color for the bar
  unit?: string;
}

/** A single macro row: label, value/target and a colored progress bar. */
export function MacroBar({ label, value, target, color, unit = 'g' }: MacroBarProps) {
  const progress = target ? value / target : 0;
  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text variant="caption" className="font-semibold">
          {label}
        </Text>
        <Text variant="caption">
          {Math.round(value)}
          {target ? ` / ${Math.round(target)}` : ''} {unit}
        </Text>
      </View>
      <View className="h-2 w-full overflow-hidden rounded-full bg-border">
        <View
          className="h-full rounded-full"
          style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}

/** Re-export so screens can use a plain bar without macros. */
export { ProgressBar };
