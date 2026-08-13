import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface RadialGlowStop {
  /** Glow colour — pass a token value (e.g. `theme.background.brandDefault`). */
  color: string;
  /** Glow centre X, as a percentage string of the box width (e.g. `'30%'`). */
  x: string;
  /** Glow centre Y, as a percentage string of the box height (e.g. `'25%'`). */
  y: string;
  /** Peak opacity at the centre, 0–1. Default `0.12`. */
  opacity?: number;
  /** Radius (% of the box) at which the glow fades fully to transparent. Default `'55%'`. */
  radius?: string;
}

export interface RadialGlowProps {
  /** Base fill colour behind the glows — pass a token value (e.g. `theme.background.paper`). */
  baseColor: string;
  /** Soft radial glows layered over the base, painted in order (first = bottom). */
  glows: RadialGlowStop[];
  /** Box style — width, height, borderRadius, etc. `overflow: hidden` is applied for you. */
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/** `#RGB` / `#RRGGBB` → `rgba(r, g, b, a)`. Falls back to the input for non-hex values. */
export function hexToRgba(hex: string, alpha: number): string {
  let h = hex.trim();
  if (h[0] === '#') h = h.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
