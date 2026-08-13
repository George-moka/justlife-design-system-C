import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { RadialGlowProps } from './types';

/**
 * Native soft-radial-glow surface (iOS/Android) using react-native-svg, which is already a
 * dependency. A base fill with one or more positioned, fading radial glows. Web uses
 * `RadialGlow.web.tsx` (CSS `radial-gradient`).
 */
export function RadialGlow({ baseColor, glows, style, children }: RadialGlowProps) {
  return (
    <View style={[{ overflow: 'hidden', backgroundColor: baseColor }, style]}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          {glows.map((g, i) => (
            <RadialGradient key={i} id={`ds-glow-${i}`} cx={g.x} cy={g.y} r={g.radius ?? '55%'}>
              <Stop offset="0" stopColor={g.color} stopOpacity={g.opacity ?? 0.12} />
              <Stop offset="1" stopColor={g.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {glows.map((_, i) => (
          <Rect key={i} x="0" y="0" width="100%" height="100%" fill={`url(#ds-glow-${i})`} />
        ))}
      </Svg>
      <View style={{ zIndex: 1 }}>{children}</View>
    </View>
  );
}
