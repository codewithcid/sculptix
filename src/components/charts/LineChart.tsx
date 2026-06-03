import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { usePalette } from '@/theme';
import { Text } from '../ui/Text';

export interface LinePoint {
  x: string; // label
  y: number;
}

interface LineChartProps {
  data: LinePoint[];
  height?: number;
  color?: string;
  /** Show the last value as a dot + label. */
  showLastDot?: boolean;
}

/** Lightweight area/line chart built on react-native-svg (no Skia needed). */
export function LineChart({ data, height = 160, color, showLastDot = true }: LineChartProps) {
  const palette = usePalette();
  const stroke = color ?? palette.primary;
  const [width, setWidth] = useState(0);

  if (data.length < 2) {
    return (
      <View
        className="items-center justify-center rounded-2xl bg-surface"
        style={{ height }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        <Text variant="caption">Not enough data yet</Text>
      </View>
    );
  }

  const pad = 8;
  const ys = data.map((d) => d.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;
  const innerW = Math.max(1, width - pad * 2);
  const innerH = height - pad * 2;

  const px = (i: number) => pad + (i / (data.length - 1)) * innerW;
  const py = (v: number) => pad + innerH - ((v - min) / range) * innerH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(d.y)}`).join(' ');
  const areaPath = `${linePath} L ${px(data.length - 1)} ${height - pad} L ${px(0)} ${height - pad} Z`;
  const last = data[data.length - 1]!;

  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={stroke} stopOpacity={0.25} />
              <Stop offset="1" stopColor={stroke} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill="url(#lineFill)" />
          <Path d={linePath} stroke={stroke} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
          {showLastDot ? (
            <Circle cx={px(data.length - 1)} cy={py(last.y)} r={4} fill={stroke} />
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
}
