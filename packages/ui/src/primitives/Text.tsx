import React, { forwardRef } from 'react';
import {
  Text as RNText,
  useWindowDimensions,
  type Text as RNTextType,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { typographyToStyle, type StringKeyOf } from '../theme/style-helpers';
import type { Tokens } from '@justlife/tokens';

export interface TextProps extends RNTextProps {
  /** Typography role from the type scale. */
  variant?: keyof Tokens['typography'];
  /** Text colour from the semantic text palette. */
  color?: StringKeyOf<Tokens['text']>;
  align?: TextStyle['textAlign'];
}

/**
 * Typographic primitive. Always renders a tokenised type style; never set
 * fontSize/fontWeight directly on `Text` — add a token instead.
 *
 * **Font-scale policy = a floor at the token size.** The OS Text-Size (Dynamic Type) setting may make text
 * **bigger** (we respect users who need that), but never **smaller** than its base token: when the user's
 * `fontScale` is below 1 we turn off scaling so text holds at its designed size; at ≥ 1 we let it grow.
 * Callers can still override `allowFontScaling`/`maxFontSizeMultiplier` per instance.
 */
export const Text = forwardRef<RNTextType, TextProps>(function Text(
  { variant = 'bodyMedium', color = 'primary', align, style, ...rest },
  ref,
) {
  const t = useTheme();
  const { fontScale } = useWindowDimensions();
  return (
    <RNText
      ref={ref}
      allowFontScaling={fontScale >= 1}
      style={[
        typographyToStyle(t.typography[variant]),
        { color: t.text[color] },
        align !== undefined && { textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
});
