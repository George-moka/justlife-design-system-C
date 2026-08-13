import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { FlagBadgeProps } from './flag-badge.types';

/** Web flag chip — an `<img>` renders the remote SVG directly. */
export function FlagBadge({ code, size, ring = false, url }: FlagBadgeProps) {
  const t = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: t.radius.pill,
        overflow: 'hidden',
        borderWidth: t.borderWidth.thin,
        borderColor: ring ? t.border.brandDefault : t.border.default,
        backgroundColor: t.background.primary,
      }}
    >
      {React.createElement('img', {
        src: url(code),
        alt: '',
        style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
      })}
    </View>
  );
}
