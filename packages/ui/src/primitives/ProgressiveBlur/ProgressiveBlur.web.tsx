import React from 'react';
import { View } from 'react-native';
import { hexToRgba } from '../RadialGlow';
import { useTheme } from '../../theme/ThemeProvider';
import type { ProgressiveBlurProps } from './types';

/**
 * Web build of {@link ProgressiveBlur}: one `backdrop-filter` layer revealed through a CSS
 * `mask-image` gradient — the same single-blur-plus-alpha-ramp the native one uses, so neither
 * platform shows the banding a stack of blur layers produces. No fill: it's a lens, not a material.
 */
export function ProgressiveBlur({ height, stepIntensity = 60, topRadius = 0, style }: ProgressiveBlurProps) {
  const t = useTheme();
  // Alpha-only ramp; the hue never renders (token-derived to stay inside the no-raw-values rule).
  const ink = (a: number) => hexToRgba(t.text.primary, a);
  const mask = `linear-gradient(to bottom, ${ink(1)} 0%, ${ink(0.6)} 45%, ${ink(0)} 100%)`;
  return (
    <View
      pointerEvents="none"
      style={[
        {
          height,
          borderTopLeftRadius: topRadius,
          borderTopRightRadius: topRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View
        // `backdropFilter` / `maskImage` aren't in RN's style types; RN-Web passes them to CSS.
        style={
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backdropFilter: `blur(${stepIntensity / 5}px)`,
            WebkitBackdropFilter: `blur(${stepIntensity / 5}px)`,
            maskImage: mask,
            WebkitMaskImage: mask,
          } as never
        }
      />
    </View>
  );
}
