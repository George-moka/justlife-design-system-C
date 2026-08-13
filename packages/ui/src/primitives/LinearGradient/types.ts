import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface LinearGradientProps {
  /**
   * Gradient stop colours, rendered top → bottom (or left → right with `horizontal`). Pass token values
   * (e.g. `[theme.background.brandSubtle, theme.background.brandDefault]`).
   */
  colors: string[];
  /** Paint the stops left → right instead of the default top → bottom (e.g. a shimmer sweep). */
  horizontal?: boolean;
  /** Box style — width, borderRadius, etc. `overflow: hidden` is applied for you. */
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}
