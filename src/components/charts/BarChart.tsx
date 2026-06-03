import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { usePalette } from '@/theme';
import { Text } from '../ui/Text';

export interface BarPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarPoint[];
  height?: number;
  color?: string;
}

/** Minimal bar chart (weekly volume / frequency) on react-native-svg. */
export function BarChart({ data, height = 160, color }: BarChartProps) {
  const palette = usePalette();
  const fill = color ?? palette.primary;
  const [width, setWidth] = useState(0);

  const max = Math.max(1, ...data.map((d) => d.value));
  const pad = 8;
  const innerH = height - pad * 2 - 16; // leave room for labels
  const gap = 8;
  const barW = width > 0 ? Math.max(4, (width - pad * 2 - gap * (data.length - 1)) / data.length) : 0;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={{ height }}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            {data.map((d, i) => {
              const h = (d.value / max) * innerH;
              const x = pad + i * (barW + gap);
              const y = pad + innerH - h;
              return (
                <Rect
                  key={i}
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(2, h)}
                  rx={4}
                  fill={d.value > 0 ? fill : palette.border}
                  opacity={d.value > 0 ? 1 : 0.6}
                />
              );
            })}
          </Svg>
        ) : null}
      </View>
      <View className="flex-row justify-between px-2">
        {data.map((d, i) => (
          <Text key={i} variant="caption" className="text-[10px]">
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
