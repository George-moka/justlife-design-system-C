import type { StyleProp, ViewStyle } from 'react-native';

export interface ProgressiveBlurProps {
  /**
   * Total height of the blur ramp. The strongest blur sits at the TOP edge and eases to nothing at the
   * bottom, so a pinned bar can blur what passes under it without ending on a hard line.
   */
  height: number;
  /** Blur strength at the strongest (top) edge, 0–100. Default 60. */
  stepIntensity?: number;
  /** Corner radius of the top edge (matches the host's rounding). */
  topRadius?: number;
  style?: StyleProp<ViewStyle>;
}
