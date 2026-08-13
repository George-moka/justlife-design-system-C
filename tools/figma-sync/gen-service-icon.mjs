// One-off: generate components/ServiceIcon/ServiceIcon.tsx from the exported service-icon assets.
import { readdir, writeFile } from 'node:fs/promises';

const DIR = 'packages/ui/src/assets/services';
const files = (await readdir(DIR)).filter((f) => f.endsWith('.png')).sort();

// svc_general_cleaning.png -> { key:'general-cleaning', varName:'svcGeneralCleaning', file:'...' }
const entries = files.map((file) => {
  const base = file.replace(/^svc_/, '').replace(/\.png$/, ''); // general_cleaning
  const key = base.replace(/_/g, '-'); // general-cleaning
  const varName = 'svc' + base.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join('');
  return { key, varName, file };
});

const imports = entries.map((e) => `import ${e.varName} from '../../assets/services/${e.file}';`).join('\n');
const union = entries.map((e) => `  | '${e.key}'`).join('\n');
const map = entries.map((e) => `  '${e.key}': ${e.varName},`).join('\n');

const out = `import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
${imports}

/**
 * Justlife service identifiers (kebab-case). The 3D service icons are pulled from the Figma service-icon set
 * (Wallet asset page). Promo/state variants (Instant, Cleaning Subscription) are intentionally excluded.
 */
export type ServiceName =
${union};

const ICONS: Record<ServiceName, number> = {
${map}
};

/** Every service name, in catalog order — handy for galleries, pickers, and tests. */
export const SERVICE_NAMES = Object.keys(ICONS) as ServiceName[];

export interface ServiceIconProps {
  /** Which service icon to render. */
  name: ServiceName;
  /** Square size in px. Defaults to \`size.40\` (40). */
  size?: number;
  /** Accessible label. Defaults to the prettified service name; pass \`''\` to mark it decorative. */
  accessibilityLabel?: string;
  style?: StyleProp<ImageStyle>;
}

/**
 * **ServiceIcon** — a 3D Justlife service icon (vacuum = General Cleaning, hair dryer = Salon & Spa, …).
 * Rendered as a square \`Image\` (transparent background, \`contain\`). Use anywhere a service needs a
 * recognizable glyph: service pickers, promo stacks, category headers.
 */
export function ServiceIcon({ name, size, accessibilityLabel, style }: ServiceIconProps) {
  const t = useTheme();
  const dim = size ?? t.size['40'];
  const label = accessibilityLabel ?? name.replace(/-/g, ' ');
  return (
    <Image
      source={ICONS[name]}
      resizeMode="contain"
      accessibilityLabel={label || undefined}
      accessibilityIgnoresInvertColors
      style={[{ width: dim, height: dim }, style]}
    />
  );
}
`;

await writeFile('packages/ui/src/components/ServiceIcon/ServiceIcon.tsx', out);
console.log(`Wrote ServiceIcon.tsx with ${entries.length} icons.`);
