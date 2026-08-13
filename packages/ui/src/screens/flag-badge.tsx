import React from 'react';
import { View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import type { FlagBadgeProps } from './flag-badge.types';

/**
 * Native flag chip. The flags are remote **SVGs** on Justlife's CDN, and RN's `<Image>` can't draw
 * those — `SvgUri` (react-native-svg, already a dependency) can. Web uses `flag-badge.web.tsx`.
 */
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
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Slightly oversized so the flag fills the circle edge to edge (flags are 4:3). */}
      <SvgUri uri={url(code)} width={size * 1.45} height={size * 1.45} />
    </View>
  );
}
