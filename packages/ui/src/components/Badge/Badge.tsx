import React, { forwardRef } from 'react';
import { Platform, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';
import type { Tokens } from '@justlife/tokens';

export type BadgeTone =
  | 'rating'
  | 'success'
  | 'neutral'
  | 'brand'
  | 'danger'
  | 'warning'
  /** Soft tints — for tags that sit ON content (service tiles) rather than beside a title. */
  | 'instant'
  | 'successSubtle'
  | 'dangerSubtle';

export interface BadgeProps extends Omit<ViewProps, 'children'> {
  /** Badge label. */
  children: React.ReactNode;
  tone?: BadgeTone;
  /** Optional leading Lucide icon (e.g. "star"). */
  icon?: string;
  /** Fill the icon (e.g. a solid rating star). */
  iconFilled?: boolean;
  /**
   * `sm` (default, 9) is the tag that sits ON something — a service tile's ETA, a rating beside a name,
   * a count in a row. `md` (11) is for a badge that stands ALONE as a line of its own, where 9 reads as
   * fine print rather than a promise (the salon hero's "At your door in 30 mins").
   *
   * This is a new size, not a bigger default: nothing that exists grows (#44 — never enlarge as a fix).
   * Reach for `md` only when the badge is the only thing on its line.
   */
  size?: BadgeSize;
}

/** `sm` — a tag on content. `md` — a badge standing on its own line. */
export type BadgeSize = 'sm' | 'md';

/** Background + foreground pairs from the `badge` tokens. */
function toneColors(t: Tokens, tone: BadgeTone): { bg: string; fg: string; icon?: string } {
  switch (tone) {
    case 'rating':
      return { bg: t.badge.bg.primary, fg: t.badge.text.info };
    case 'success':
      // `badge.text.success` (#496B00), not `text.info` — the info token is a BROWN, and on the green
      // pill it read as a muddy label. Figma's "Booked 9x" tag pairs bg.success with text.success.
      return { bg: t.badge.bg.success, fg: t.badge.text.success };
    case 'brand':
      return { bg: t.badge.bg.brand, fg: t.badge.text.inverse };
    case 'danger':
      return { bg: t.badge.bg.danger, fg: t.badge.text.inverse };
    case 'warning':
      return { bg: t.badge.bg.warning, fg: t.badge.text.inverse };
    // ── tint tones: soft same-hue background + a deep same-hue label (all from our ramps) ──
    case 'instant':
      // The bolt reads a step lighter than the label, so the glyph accents without shouting.
      return { bg: t.badge.bg.instant, fg: t.badge.text.instant, icon: t.badge.text.instantIcon };
    case 'successSubtle':
      return { bg: t.badge.bg.successSubtle, fg: t.badge.text.successSubtle };
    case 'dangerSubtle':
      return { bg: t.badge.bg.dangerSubtle, fg: t.badge.text.dangerSubtle };
    case 'neutral':
    default:
      return { bg: t.badge.bg.neutral, fg: t.badge.text.primary };
  }
}

/**
 * Compact pill badge (Figma "Rating Tag" / badge). Tone selects the
 * background/foreground from the `badge` tokens; supports an optional leading
 * icon (e.g. a filled rating star). Sized for inline use next to titles.
 */
export const Badge = forwardRef<ViewType, BadgeProps>(function Badge(
  { children, tone = 'neutral', icon, iconFilled = false, size = 'sm', style, ...rest },
  ref,
) {
  const t = useTheme();
  const { bg, fg, icon: iconColor } = toneColors(t, tone);
  const variant = size === 'md' ? 'labelXSmall' : 'labelXXSmall';
  const type = t.typography[variant];
  return (
    <View
      ref={ref}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: t.size['2'],
          paddingHorizontal: t.space.sm,
          // A leading glyph brings its own side-bearing: the bolt's ink starts a couple of points inside
          // its box, so full text padding on that side reads as a gap. Trim it at `md`, where the icon
          // box is bigger and the effect is visible. (`sm` is left alone — every existing tag uses it.)
          ...(size === 'md' && icon ? { paddingLeft: t.space.xs } : null),
          paddingVertical: t.size['2'],
          borderRadius: t.radius.sm,
          backgroundColor: bg,
        },
        style,
      ]}
      {...rest}
    >
      {icon ? (
        <Icon
          name={icon}
          size={size === 'md' ? 'sm' : 'xs'}
          color={iconColor ?? fg}
          fill={iconFilled ? (iconColor ?? fg) : 'none'}
        />
      ) : null}
      {/* Optical centering of the small-caps label. The variant's 1.44× leading parks the caps HIGH. On WEB,
          hugging the line box to the font size fixes it (AGENTS #39). But on NATIVE (iOS especially) a
          sub-natural lineHeight makes the caps ride high / clip — so there we keep the font's NATURAL line box
          (its descender room re-balances the caps) and trim Android's extra font padding. Cross-platform. */}
      <Text
        variant={variant}
        style={{
          color: fg,
          ...(Platform.OS === 'web'
            ? { lineHeight: type.fontSize }
            : { includeFontPadding: false }),
        }}
      >
        {children}
      </Text>
    </View>
  );
});
