import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop } from 'react-native-svg';
import type { LinearGradientProps } from './types';

/**
 * Native linear gradient (iOS/Android) using react-native-svg, which is already a dependency. Vertical
 * (top → bottom) by default; pass `horizontal` for left → right. Web uses `LinearGradient.web.tsx`.
 */
export function LinearGradient({ colors, horizontal, style, children }: LinearGradientProps) {
  const last = Math.max(1, colors.length - 1);
  // Per-instance id so multiple gradients with different stops don't collide on one shared `<Defs>` id.
  const gid = `ds-grad-${useId().replace(/:/g, '')}`;
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <SvgGradient id={gid} x1="0" y1="0" x2={horizontal ? '1' : '0'} y2={horizontal ? '0' : '1'}>
            {colors.map((color, i) => (
              <Stop key={i} offset={i / last} stopColor={color} />
            ))}
          </SvgGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gid})`} />
      </Svg>
      {children}
    </View>
  );
}
