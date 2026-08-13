import type { Tokens } from '@justlife/tokens';

/**
 * Icons come from Lucide (https://lucide.dev) — our official icon library.
 * `lucide-react` renders on web, `lucide-react-native` on native; the `Icon`
 * component picks the right one via the platform file. Custom Justlife icons
 * will be added later.
 */
export interface IconProps {
  /** Lucide icon name in kebab-case, e.g. "check", "chevron-right". Browse https://lucide.dev/icons */
  name: string;
  /** Size from the icon-size token scale, or an explicit pixel size. */
  size?: keyof Tokens['iconSize'] | number;
  /** Stroke colour — pass a token value (e.g. `theme.icon.primary`). Defaults to icon.primary. */
  color?: string;
  /** Fill colour for solid glyphs (e.g. a filled rating star). Pass a token value; omit for outline. */
  fill?: string;
  strokeWidth?: number;
  /** Accessible label; omit for decorative icons. */
  label?: string;
}

/** Convert a Lucide kebab name ("chevron-right") to its component key ("ChevronRight"). */
export function toPascalCase(name: string): string {
  return name
    .split('-')
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : ''))
    .join('');
}

/** A small sample for docs/examples — any Lucide name works, this is not a limit. */
export const sampleIcons = [
  'check',
  'x',
  'chevron-right',
  'chevron-down',
  'search',
  'plus',
  'minus',
  'arrow-right',
  'info',
  'star',
  'heart',
  'calendar',
  'clock',
  'user',
  'settings',
  'house',
  'bell',
  'trash-2',
  'pencil',
  'map-pin',
] as const;
