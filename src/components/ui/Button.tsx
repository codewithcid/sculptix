import React from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-primary active:opacity-80',
  secondary: 'bg-surface-elevated border border-border active:opacity-70',
  ghost: 'bg-transparent active:opacity-60',
  danger: 'bg-danger active:opacity-80',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-text',
  ghost: 'text-primary',
  danger: 'text-white',
};

const SIZE: Record<Size, string> = {
  sm: 'h-10 px-4 rounded-xl',
  md: 'h-12 px-5 rounded-2xl',
  lg: 'h-14 px-6 rounded-2xl',
};

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  className?: string;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  leftIcon,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`flex-row items-center justify-center ${SIZE[size]} ${CONTAINER[variant]} ${
        fullWidth ? 'w-full' : 'self-start'
      } ${isDisabled ? 'opacity-50' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : undefined} />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text className={`text-base font-bold ${LABEL[variant]}`}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
