import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
// expo-glass-effect is provided at runtime by apps/prototype (bundled in Expo Go SDK 54); @justlife/ui
// declares an ambient module (src/types/expo-glass-effect.d.ts) so source-consumed TS typechecks
// without bundling the dep into web/tests (web uses GlassSurface.web.tsx).
import { GlassView, isLiquidGlassAvailable, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { useTheme, useThemeName } from '../../theme/ThemeProvider';
import { elevationToStyle } from '../../theme/style-helpers';
import type { GlassSurfaceProps } from './types';

/**
 * Liquid-glass surface (native), best-effort by capability:
 *   1. iOS 26+             → expo-glass-effect `GlassView` — the REAL Apple Liquid Glass (backdrop blur
 *                            + edge lensing/refraction + specular rim + adaptive tint). Renders in Expo Go.
 *   2. iOS < 26 / Android  → expo-blur `BlurView` frosted glass (real OS backdrop blur, no lensing).
 *   3. Reduce Transparency → honest opaque token surface (legible; iOS collapses blur materials anyway).
 *
 * SOLID-WHITE RULE (this whole component exists to avoid it):
 *   • the tint is laid into `GlassView` as a NATIVE `tintColor`, not as an opaque overlay;
 *   • on the blur fallback the tint overlay is capped at `glass.tint` (≤0.18 white);
 *   • a glass surface must sit over VARIED content — over flat white it reads white no matter what
 *     (that is physics, not a bug; see GlassSurface.stories "Glass Proof").
 *   • do NOT animate opacity→0 on this or any ancestor (expo-glass-effect #41024).
 *
 * Web uses GlassSurface.web.tsx (CSS backdrop-filter).
 */
export function GlassSurface({ radius, tint = 'regular', noShadow, style, children }: GlassSurfaceProps) {
  const t = useTheme();
  const name = useThemeName();
  const r = radius ?? t.radius.lg;
  const fill = tint === 'strong' ? t.glass.tintStrong : t.glass.tint;

  // iOS "Reduce Transparency" collapses UIVisualEffectView/UIGlassEffect to an opaque material.
  const [reduceTransparency, setReduceTransparency] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled?.().then((v) => mounted && setReduceTransparency(!!v));
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', (v) => setReduceTransparency(!!v));
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  // True Liquid Glass only on iOS 26+ with the API present (guards iOS 26 betas / older runtimes).
  const liquidGlass = Platform.OS === 'ios' && !reduceTransparency && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  const shadow = noShadow ? null : elevationToStyle(t.elevation.sheet);

  // Hairline edge rim + top specular sheen — the glass edge, shared by both glass paths.
  const chrome = (
    <React.Fragment>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: r, borderWidth: t.borderWidth.hairline, borderColor: t.glass.border }}
      />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: r, right: r, height: t.borderWidth.hairline, backgroundColor: t.glass.highlight }} />
    </React.Fragment>
  );

  // 1 — TRUE Liquid Glass (iOS 26+). tintColor is native, so the material refracts content rather than
  // being hidden by an overlay. `key={name}` forces a remount on theme switch (expo-glass-effect #43743:
  // colorScheme prop changes don't update the live material).
  if (liquidGlass) {
    // NO manual edge/sheen overlays here — GlassView renders its own native specular rim + lensing;
    // painting a border/highlight on top flattens it back to a plain frosted panel. Let the OS material
    // do the work; keep children background-transparent so refraction shows through.
    return (
      <View style={[{ borderRadius: r }, shadow, style]}>
        <GlassView
          key={name}
          glassEffectStyle="regular"
          tintColor={fill}
          colorScheme={name === 'dark' ? 'dark' : 'light'}
          style={{ flex: 1, borderRadius: r, overflow: 'hidden' }}
        >
          {children}
        </GlassView>
      </View>
    );
  }

  // 3 — Reduce Transparency → honest opaque surface (raised white).
  if (Platform.OS === 'ios' && reduceTransparency) {
    return (
      <View style={[{ borderRadius: r }, shadow, style]}>
        <View style={{ flex: 1, borderRadius: r, overflow: 'hidden', backgroundColor: t.background.surfaceRaised ?? t.background.surface }}>
          {chrome}
          {children}
        </View>
      </View>
    );
  }

  // 2 — expo-blur frosted fallback (iOS < 26 / Android). System material = most authentic frost;
  // Android needs experimentalBlurMethod or no real blur happens.
  return (
    <View style={[{ borderRadius: r }, shadow, style]}>
      <View style={{ flex: 1, borderRadius: r, overflow: 'hidden' }}>
        <BlurView
          intensity={t.glass.intensity}
          tint={name === 'dark' ? 'systemThinMaterialDark' : 'systemThinMaterialLight'}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={StyleSheet.absoluteFill}
        />
        {/* Translucent tint OVER the blur — CAPPED at glass.tint (≤0.18 white). Raising this is the
            solid-white bug; never go opaque here. */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: fill }]} pointerEvents="none" />
        {chrome}
        {children}
      </View>
    </View>
  );
}
