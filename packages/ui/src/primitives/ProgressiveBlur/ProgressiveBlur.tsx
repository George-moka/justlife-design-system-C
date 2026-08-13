import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';
// expo's NATIVE gradient, not our SVG one: a MaskedView mask reads the element's alpha, and
// react-native-svg's alpha never reaches iOS's mask layer — the ramp silently collapses into the
// container's rectangle and the blur cuts off on a hard line.
import { LinearGradient } from 'expo-linear-gradient';
import { hexToRgba } from '../RadialGlow';
import { useTheme } from '../../theme/ThemeProvider';
import type { ProgressiveBlurProps } from './types';

/**
 * **Progressive blur** (native) — a blur that is strongest at the top edge and eases to nothing at the
 * bottom, with **no fill of its own**.
 *
 * One blur, revealed through a gradient **alpha mask**. The obvious alternative — stacking several blur
 * layers of decreasing height so they accumulate — banded badly: every layer ends on a hard line, and
 * you could count the stages. Masking a single `BlurView` cross-fades the blurred image back to the
 * sharp one continuously, so there is no edge anywhere in the ramp.
 *
 * Why not `GlassSurface`: that is a *material* — it carries a tint by design, which reads as a solid
 * background. This is only a lens: whatever scrolls underneath stays visible, just progressively soft.
 *
 * Web uses `ProgressiveBlur.web.tsx` (`backdrop-filter` + CSS `mask-image`).
 */
export function ProgressiveBlur({ height, stepIntensity = 60, topRadius = 0, style }: ProgressiveBlurProps) {
  const t = useTheme();
  // A mask carries ALPHA only — the hue never renders, so it's derived from a token purely to stay
  // inside the no-raw-values rule.
  const ink = (a: number) => hexToRgba(t.text.primary, a);
  return (
    <View pointerEvents="none" style={[{ height, overflow: 'hidden', borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius }, style]}>
      <MaskedView
        style={StyleSheet.absoluteFill}
        // Opaque at the top → transparent at the foot. The mask only needs alpha, so the colour is
        // arbitrary; the middle stop keeps the falloff from reading as linear-and-abrupt.
        maskElement={
          <LinearGradient
            colors={[ink(1), ink(1), ink(0.55), ink(0)]}
            // Hold full strength under the header, then ease out over the lower two thirds.
            locations={[0, 0.35, 0.7, 1]}
            style={StyleSheet.absoluteFillObject}
          />
        }
      >
        <BlurView intensity={stepIntensity} tint="light" style={StyleSheet.absoluteFill} />
      </MaskedView>
    </View>
  );
}
