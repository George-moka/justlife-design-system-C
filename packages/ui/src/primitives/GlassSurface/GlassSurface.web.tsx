import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { elevationToStyle } from '../../theme/style-helpers';
import type { GlassSurfaceProps } from './types';

/**
 * Liquid-glass surface (web) — CSS `backdrop-filter: blur()` on a tinted, rounded element, with a
 * hairline edge and a top specular sheen. Mirrors the native `GlassSurface.tsx` (expo-blur). The
 * outer view carries the shadow; the inner clip blurs the page content behind it.
 */
export function GlassSurface({ radius, tint = 'regular', noShadow, style, children }: GlassSurfaceProps) {
  const t = useTheme();
  const r = radius ?? t.radius.lg;
  const fill = tint === 'strong' ? t.glass.tintStrong : t.glass.tint;
  // saturate() boosts the blurred colour (vibrancy) WITHOUT raising the tint alpha — keeps it glassy,
  // not solid. Gotcha: backdrop-filter silently no-ops if an ancestor has opacity<1 / transform / filter.
  const backdrop = `blur(${t.glass.blur}px) saturate(1.8)`;
  return (
    <View style={[{ borderRadius: r }, noShadow ? null : elevationToStyle(t.elevation.sheet), style]}>
      <View
        // backdrop-filter isn't in RN's ViewStyle; RNW passes it through to the DOM.
        style={[
          { flex: 1, borderRadius: r, overflow: 'hidden', backgroundColor: fill },
          { backdropFilter: backdrop, WebkitBackdropFilter: backdrop } as object,
        ]}
      >
        {/* Hairline edge highlight. */}
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: r, borderWidth: t.borderWidth.hairline, borderColor: t.glass.border }}
        />
        {/* Top specular sheen. */}
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: r, right: r, height: t.borderWidth.hairline, backgroundColor: t.glass.highlight }} />
        {children}
      </View>
    </View>
  );
}
