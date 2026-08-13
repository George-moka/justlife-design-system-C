// Minimal ambient types for `expo-linear-gradient`, used ONLY as the alpha mask of the native
// ProgressiveBlur. Our own SVG-based `LinearGradient` primitive cannot serve as a `MaskedView` mask —
// react-native-svg's alpha doesn't reach the iOS mask layer, which silently degrades the ramp into the
// container's plain rectangle. The real module ships with the Expo app (bundled in Expo Go).
declare module 'expo-linear-gradient' {
  import type { ComponentType } from 'react';
  import type { ViewProps } from 'react-native';
  export interface LinearGradientProps extends ViewProps {
    colors: readonly string[];
    /** Stop positions, 0–1, one per colour. */
    locations?: readonly number[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  }
  export const LinearGradient: ComponentType<LinearGradientProps>;
}
