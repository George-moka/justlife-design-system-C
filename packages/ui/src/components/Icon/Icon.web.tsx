import React from 'react';
import { icons as lucideIcons } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { toPascalCase, type IconProps } from './icons';
import { brandGlyphs } from './brand-glyphs';

type LucideComp = React.ComponentType<{
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}>;

/** Web icon — renders a Lucide DOM SVG. Native uses `Icon.tsx`. */
export function Icon({ name, size = 'md', color, fill, strokeWidth = 1.5, label }: IconProps) {
  const t = useTheme();
  const dimension = typeof size === 'number' ? size : t.iconSize[size];
  const stroke = color ?? t.icon.primary;
  // Brand glyphs (extracted from Figma) win over Lucide — see `brand-glyphs.ts`.
  const brand = brandGlyphs[name];
  if (brand) {
    return (
      <svg
        width={dimension}
        height={dimension}
        viewBox={brand.viewBox}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        style={{ display: 'block' }}
      >
        <path d={brand.path} fill={stroke} />
      </svg>
    );
  }
  const Glyph = (lucideIcons as Record<string, LucideComp>)[toPascalCase(name)];
  if (!Glyph) {
    console.warn(`[Icon] Unknown Lucide icon: "${name}" — browse https://lucide.dev/icons`);
    return null;
  }
  return (
    <Glyph
      size={dimension}
      color={stroke}
      fill={fill ?? 'none'}
      strokeWidth={strokeWidth}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
