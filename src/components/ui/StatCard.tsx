import React from 'react';
import { View } from 'react-native';
import { Card } from './Card';
import { Text } from './Text';

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: string;
  tone?: 'default' | 'primary' | 'accent';
  className?: string;
}

export function StatCard({ label, value, sublabel, icon, tone = 'default', className = '' }: StatCardProps) {
  const valueColor =
    tone === 'primary' ? 'text-primary' : tone === 'accent' ? 'text-accent' : 'text-text';
  return (
    <Card className={`flex-1 ${className}`} elevated>
      <View className="flex-row items-center justify-between">
        <Text variant="label">{label}</Text>
        {icon ? <Text className="text-base">{icon}</Text> : null}
      </View>
      <Text className={`mt-2 text-2xl font-extrabold ${valueColor}`}>{value}</Text>
      {sublabel ? <Text variant="caption">{sublabel}</Text> : null}
    </Card>
  );
}
