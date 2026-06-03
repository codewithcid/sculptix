import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

type Variant = 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'caption' | 'label';

const VARIANT_CLASS: Record<Variant, string> = {
  display: 'text-4xl font-extrabold text-text',
  title: 'text-2xl font-bold text-text',
  heading: 'text-xl font-bold text-text',
  subheading: 'text-base font-semibold text-text',
  body: 'text-base text-text',
  caption: 'text-sm text-text-muted',
  label: 'text-xs font-semibold uppercase tracking-wide text-text-muted',
};

export interface TextProps extends RNTextProps {
  variant?: Variant;
  /** Additional NativeWind classes (override colors etc.). */
  className?: string;
  muted?: boolean;
}

/** Themed text primitive. Color comes from the `text` token by default. */
export function Text({ variant = 'body', muted, className = '', ...rest }: TextProps) {
  const base = VARIANT_CLASS[variant];
  const mutedClass = muted ? 'text-text-muted' : '';
  return <RNText className={`${base} ${mutedClass} ${className}`} {...rest} />;
}
