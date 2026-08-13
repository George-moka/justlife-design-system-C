import React, { forwardRef } from 'react';
import { View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { StringKeyOf } from '../theme/style-helpers';
import type { Tokens } from '@justlife/tokens';

export interface BoxProps extends ViewProps {
  /** Padding on all sides, from the spacing scale. */
  padding?: keyof Tokens['space'];
  paddingX?: keyof Tokens['space'];
  paddingY?: keyof Tokens['space'];
  /** Background from the semantic background palette. */
  background?: StringKeyOf<Tokens['background']>;
  /** Corner radius from the radius scale. */
  radius?: keyof Tokens['radius'];
  grow?: boolean;
}

/**
 * The base layout primitive — a token-aware `View`. Everything else composes
 * from `Box`. Use it instead of a raw `View` so spacing/colour stay tokenised.
 */
export const Box = forwardRef<ViewType, BoxProps>(function Box(
  { padding, paddingX, paddingY, background, radius, grow, style, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <View
      ref={ref}
      style={[
        padding !== undefined && { padding: t.space[padding] },
        paddingX !== undefined && { paddingHorizontal: t.space[paddingX] },
        paddingY !== undefined && { paddingVertical: t.space[paddingY] },
        background !== undefined && { backgroundColor: t.background[background] },
        radius !== undefined && { borderRadius: t.radius[radius] },
        grow && { flexGrow: 1 },
        style,
      ]}
      {...rest}
    />
  );
});
