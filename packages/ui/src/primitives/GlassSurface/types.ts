import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface GlassSurfaceProps {
  /** Corner radius — match the host's rounding (pill bars, sheet cards). Defaults to `radius.lg`. */
  radius?: number;
  /** `regular` (default) or `strong` — a denser tint for busy backdrops. */
  tint?: 'regular' | 'strong';
  /** Drop the elevation shadow (e.g. the host already casts one). Shadow shows by default. */
  noShadow?: boolean;
  /**
   * Use as a wrapping container (pass children) OR as an absolute-fill background layer
   * (pass `style={StyleSheet.absoluteFill}` and omit children, rendering content as siblings on top).
   */
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}
