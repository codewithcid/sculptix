import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { usePalette } from '@/theme';
import { formatDuration } from '@/utils';
import { Text } from './ui/Text';

interface RestTimerProps {
  /** Initial duration in seconds. */
  seconds: number;
  onComplete?: () => void;
  onDismiss?: () => void;
}

/**
 * Circular rest countdown with start/pause, ±15s and skip controls.
 * Self-contained (own interval); the parent shows/hides it between sets.
 */
export function RestTimer({ seconds, onComplete, onDismiss }: RestTimerProps) {
  const palette = usePalette();
  const [total, setTotal] = useState(seconds);
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);
  const completedRef = useRef(false);

  useEffect(() => {
    setTotal(seconds);
    setRemaining(seconds);
    setRunning(true);
    completedRef.current = false;
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onComplete]);

  const size = 200;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? remaining / total : 0;

  const adjust = (delta: number) => {
    setRemaining((r) => Math.max(0, r + delta));
    setTotal((t) => Math.max(1, t + delta));
  };

  return (
    <View className="items-center gap-5">
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={palette.border} strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={palette.primary}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View className="absolute items-center">
          <Text className="text-5xl font-extrabold text-text">{formatDuration(remaining)}</Text>
          <Text variant="caption">rest</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <Control label="-15s" onPress={() => adjust(-15)} />
        <Pressable
          onPress={() => setRunning((r) => !r)}
          className="h-14 w-14 items-center justify-center rounded-full bg-primary active:opacity-80"
        >
          <Text className="text-xl text-primary-foreground">{running ? '⏸' : '▶'}</Text>
        </Pressable>
        <Control label="+15s" onPress={() => adjust(15)} />
      </View>

      <Pressable onPress={onDismiss} className="px-4 py-2 active:opacity-70">
        <Text className="font-semibold text-primary">Skip rest</Text>
      </Pressable>
    </View>
  );
}

function Control({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="h-12 w-16 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
    >
      <Text className="font-semibold text-text">{label}</Text>
    </Pressable>
  );
}
