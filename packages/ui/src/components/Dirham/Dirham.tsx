import React from 'react';
import type { TextStyle, StyleProp } from 'react-native';
import { Text, type TextProps } from '../../primitives/Text';
import type { Tokens } from '@justlife/tokens';
import type { StringKeyOf } from '../../theme/style-helpers';

/**
 * The font family the UAE dirham symbol ships under (`assets/fonts/aed-Regular.otf`). Each platform must
 * register it ONCE under this exact name: Storybook via the `@font-face` in `preview-head.html` (the file
 * is also copied to `apps/storybook/public/fonts/`), the Expo app via `useFonts({ [AED_FONT_FAMILY]: … })`.
 */
export const AED_FONT_FAMILY = 'aed';

/**
 * What we render: the literal string "AED". The symbol font maps `A`/`E` to zero-width empty glyphs and
 * `D` to the dirham symbol, so with the font loaded "AED" draws as JUST the symbol — and if the font is
 * missing (web fallback chain, native load race) it degrades gracefully to readable "AED" text.
 */
export const AED_TEXT = 'AED';

export interface DirhamProps {
  /** Typography role — sizes the symbol exactly like the sibling `Text` it sits beside. */
  variant?: keyof Tokens['typography'];
  /** Text colour from the semantic palette (match the sibling amount text). */
  color?: StringKeyOf<Tokens['text']>;
  /** Overrides (e.g. a baseline-seat nudge next to a larger numeral). */
  style?: StyleProp<TextStyle>;
  /** Screen-reader label. Defaults to "AED". */
  accessibilityLabel?: string;
  allowFontScaling?: TextProps['allowFontScaling'];
}

/**
 * **Dirham** — the official UAE dirham currency symbol, as text. Renders "AED" in the single-glyph symbol
 * font (see {@link AED_TEXT} for the trick), so it scales, colours, aligns and falls back exactly like the
 * amount text it accompanies — never an image. Pair it with the amount's own variant:
 *
 * ```tsx
 * <HStack gap="xs" align="center">
 *   <Dirham variant="headlineSmall" color="promoDark" />
 *   <Text variant="headlineSmall" color="promoDark">1000</Text>
 * </HStack>
 * ```
 *
 * The weight is pinned to normal — the symbol is a fixed single-weight design; letting a variant's 600
 * leak in would faux-bolden it on web.
 */
export function Dirham({ variant = 'titleMedium', color = 'primary', style, accessibilityLabel = 'AED', allowFontScaling }: DirhamProps) {
  return (
    <Text
      variant={variant}
      color={color}
      accessibilityLabel={accessibilityLabel}
      allowFontScaling={allowFontScaling}
      style={[{ fontFamily: AED_FONT_FAMILY, fontWeight: '400' }, style]}
    >
      {AED_TEXT}
    </Text>
  );
}
