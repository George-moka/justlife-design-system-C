import React from 'react';
import { View } from 'react-native';
import { hexToRgba, type RadialGlowProps } from './types';

/**
 * Web soft-radial-glow surface — a base colour with one or more positioned, fading
 * radial glows painted as stacked CSS `radial-gradient` layers. Native uses
 * `RadialGlow.tsx` (react-native-svg). No extra dependency on web.
 */
export function RadialGlow({ baseColor, glows, style, children }: RadialGlowProps) {
  const layers = glows
    .map(
      (g) =>
        `radial-gradient(circle at ${g.x} ${g.y}, ${hexToRgba(g.color, g.opacity ?? 0.12)} 0%, transparent ${g.radius ?? '55%'})`,
    )
    .join(', ');
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: baseColor,
          backgroundImage: layers,
        }}
      />
      <View style={{ zIndex: 1 }}>{children}</View>
    </View>
  );
}
