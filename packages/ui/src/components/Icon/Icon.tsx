import React from 'react';
// lucide-react-native exports named components (no `icons` map like the web build),
// so resolve by name from the module namespace.
import * as LucideNative from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { toPascalCase, type IconProps } from './icons';
import { brandGlyphs } from './brand-glyphs';
import Svg, { Path } from 'react-native-svg';

type LucideComp = React.ComponentType<{
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  accessibilityLabel?: string;
}>;

/** Native icon (iOS/Android) — renders a Lucide react-native-svg glyph. Web uses `Icon.web.tsx`. */
export function Icon({ name, size = 'md', color, fill, strokeWidth = 1.5, label }: IconProps) {
  const t = useTheme();
  const dimension = typeof size === 'number' ? size : t.iconSize[size];
  const stroke = color ?? t.icon.primary;
  // Brand glyphs (extracted from Figma) win over Lucide — see `brand-glyphs.ts`.
  const brand = brandGlyphs[name];
  if (brand) {
    return (
      <Svg width={dimension} height={dimension} viewBox={brand.viewBox} accessibilityLabel={label}>
        <Path d={brand.path} fill={stroke} />
      </Svg>
    );
  }
  const Glyph = (LucideNative as unknown as Record<string, LucideComp>)[toPascalCase(name)];
  if (!Glyph) return null;
  return (
    <Glyph size={dimension} color={stroke} fill={fill ?? 'none'} strokeWidth={strokeWidth} accessibilityLabel={label} />
  );
}
