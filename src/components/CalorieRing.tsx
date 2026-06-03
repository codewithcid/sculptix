import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { usePalette } from '@/theme';
import { Text } from './ui/Text';

interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

/** Circular calorie progress ring with remaining-calories center label. */
export function CalorieRing({ consumed, target, size = 160, strokeWidth = 14 }: CalorieRingProps) {
  const palette = usePalette();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  const over = target > 0 && consumed > target;
  const remaining = Math.max(0, Math.round(target - consumed));
  const dashOffset = circumference * (1 - pct);
  const ringColor = over ? palette.danger : palette.primary;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palette.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-3xl font-extrabold text-text">{remaining}</Text>
        <Text variant="caption">{over ? 'over' : 'kcal left'}</Text>
        <Text variant="caption" className="mt-0.5">
          {Math.round(consumed)} / {target}
        </Text>
      </View>
    </View>
  );
}
