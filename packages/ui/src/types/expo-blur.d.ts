// Minimal ambient types for `expo-blur` so @justlife/ui typechecks the NATIVE GlassSurface
// (GlassSurface.tsx). The real module is provided at runtime by the Expo app (apps/prototype) and
// resolved by Metro; web + tests use GlassSurface.web.tsx and never import this module.
declare module 'expo-blur' {
  import type { ComponentType } from 'react';
  import type { ViewProps } from 'react-native';
  export type BlurTint =
    | 'light'
    | 'dark'
    | 'default'
    | 'extraLight'
    | 'regular'
    | 'prominent'
    | 'systemUltraThinMaterial'
    | 'systemThinMaterial'
    | 'systemMaterial'
    | 'systemThickMaterial'
    | 'systemChromeMaterial'
    | 'systemUltraThinMaterialLight'
    | 'systemThinMaterialLight'
    | 'systemMaterialLight'
    | 'systemThickMaterialLight'
    | 'systemChromeMaterialLight'
    | 'systemUltraThinMaterialDark'
    | 'systemThinMaterialDark'
    | 'systemMaterialDark'
    | 'systemThickMaterialDark'
    | 'systemChromeMaterialDark';
  export interface BlurViewProps extends ViewProps {
    /** 0–100 perceptual blur strength. */
    intensity?: number;
    tint?: BlurTint;
    /** Android-only blur backend (SDK 54 name). */
    experimentalBlurMethod?: 'none' | 'dimezisBlurView';
  }
  export const BlurView: ComponentType<BlurViewProps>;
}
