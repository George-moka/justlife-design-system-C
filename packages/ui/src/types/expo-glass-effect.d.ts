// Minimal ambient types for `expo-glass-effect` (Apple iOS 26 Liquid Glass / UIGlassEffect) so
// @justlife/ui typechecks the NATIVE GlassSurface (GlassSurface.tsx). The real module is provided at
// runtime by the Expo app (apps/prototype, SDK 54 — bundled in Expo Go) and resolved by Metro; web +
// tests use GlassSurface.web.tsx and never import this module.
declare module 'expo-glass-effect' {
  import type { ComponentType, ReactNode } from 'react';
  import type { ViewProps } from 'react-native';
  export type GlassStyle = 'clear' | 'regular' | 'none';
  export interface GlassViewProps extends ViewProps {
    glassEffectStyle?: GlassStyle;
    /** Tint laid into the native material (NOT an overlay), so refraction is preserved. */
    tintColor?: string;
    colorScheme?: 'auto' | 'light' | 'dark';
    /** Interactive (touch-reactive) glass. */
    isInteractive?: boolean;
    children?: ReactNode;
  }
  export const GlassView: ComponentType<GlassViewProps>;
  /** True when the OS exposes the Liquid Glass API (iOS 26+). */
  export function isLiquidGlassAvailable(): boolean;
  /** True when the expo-glass-effect native API is present in the running binary. */
  export function isGlassEffectAPIAvailable(): boolean;
}
