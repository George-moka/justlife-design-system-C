import React, { forwardRef } from 'react';
import { View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarTone = 'brand' | 'neutral';

export interface AvatarProps extends Omit<ViewProps, 'children'> {
  /** Full name — initials are derived from it ("Cem Mirkelam" → "CM"). */
  name?: string;
  /** Explicit initials (max 2 shown); overrides the `name` derivation. */
  initials?: string;
  /** `sm` 40 · `md` 56 · `lg` 72, or a raw pixel diameter. Default `md`. */
  size?: AvatarSize | number;
  /** `brand` = light-blue chip + dark initials (default) · `neutral` = grey chip. */
  tone?: AvatarTone;
  accessibilityLabel?: string;
}

const SIZE_TOKEN = { sm: '40', md: '56', lg: '72' } as const;
const SIZE_VARIANT = { sm: 'titleMedium', md: 'titleLarge', lg: 'headlineSmall' } as const;

/** First letters of the first + last words, uppercased (max 2 chars). */
export function toInitials(name?: string, initials?: string): string {
  if (initials != null && initials.trim() !== '') return initials.trim().slice(0, 2).toUpperCase();
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * **Avatar** — a circular identity badge showing a person's **initials** (Justlife has no profile
 * photos, so the avatar is initials-only). Initials derive from `name`, or set `initials` directly.
 * `tone` picks the chip colour: `brand` (light-blue `avatar.bg.primary`, the default) or `neutral`
 * (grey); initials stay dark for contrast. Fully tokenised — the initials use a type-scale variant
 * sized to the circle.
 *
 * NOTE (a11y, deliberate): the initials use `text.primary` (#1A1A1A on #B3EEFF ≈ 13.7:1, passes AA),
 * **not** the reserved `avatar.text.color` (#00A8DC). That reserved cyan-on-pale-blue pairing only
 * reaches ≈2.17:1 and fails AA, so do not "restore" it here without darkening the chip first.
 */
export const Avatar = forwardRef<ViewType, AvatarProps>(function Avatar(
  { name, initials, size = 'md', tone = 'brand', accessibilityLabel, style, ...rest },
  ref,
) {
  const t = useTheme();
  const diameter = typeof size === 'number' ? size : t.size[SIZE_TOKEN[size]];
  const variant = typeof size === 'number' ? 'titleLarge' : SIZE_VARIANT[size];
  const text = toInitials(name, initials);
  const bg = tone === 'neutral' ? t.avatar.bg.neutral : t.avatar.bg.primary;
  const a11yLabel = accessibilityLabel ?? name ?? (text !== '' ? text : 'Avatar');

  return (
    <View
      ref={ref}
      accessibilityRole="image"
      accessibilityLabel={a11yLabel}
      style={[
        {
          width: diameter,
          height: diameter,
          borderRadius: t.radius.pill,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      {...rest}
    >
      <Text variant={variant} color="primary">
        {text}
      </Text>
    </View>
  );
});
