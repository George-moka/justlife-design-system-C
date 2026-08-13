import React from 'react';
import { View } from 'react-native';
import type { LinearGradientProps } from './types';

/**
 * Web linear gradient — paints a CSS gradient layer behind the content. Vertical (top → bottom) by
 * default; pass `horizontal` for left → right. Native uses `LinearGradient.tsx` (react-native-svg).
 */
export function LinearGradient({ colors, horizontal, style, children }: LinearGradientProps) {
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${horizontal ? '90deg' : '180deg'}, ${colors.join(', ')})`,
        }}
      />
      <View style={{ zIndex: 1 }}>{children}</View>
    </View>
  );
}
