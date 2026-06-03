import React from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

interface ScreenProps extends ViewProps {
  /** Wrap children in a ScrollView. */
  scroll?: boolean;
  /** Apply default horizontal padding. */
  padded?: boolean;
  edges?: Edge[];
  contentClassName?: string;
}

/** Page wrapper handling safe areas and the themed background. */
export function Screen({
  scroll = false,
  padded = true,
  edges = ['top'],
  className = '',
  contentClassName = '',
  children,
  ...rest
}: ScreenProps) {
  const padding = padded ? 'px-5' : '';

  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-background ${className}`} {...rest}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={`${padding} pb-10 ${contentClassName}`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`flex-1 ${padding} ${contentClassName}`}>{children}</View>
      )}
    </SafeAreaView>
  );
}
