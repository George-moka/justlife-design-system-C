import React, { forwardRef } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Icon } from '../Icon';

export type StarRatingSize = 'sm' | 'md' | 'lg';

export interface StarRatingProps extends Omit<ViewProps, 'children'> {
  /** Filled stars (0…max). 0 → all empty grey (an unrated item). */
  value?: number;
  /** Total stars. Default 5. */
  max?: number;
  size?: StarRatingSize;
  /** When set, each star is tappable and calls back with its 1-based value — turns this into an input. */
  onRate?: (rating: number) => void;
}

/**
 * **StarRating** — a row of stars: empty stars are a soft grey, filled stars take the rating gold. Read-only
 * by default; pass `onRate` to make each star a tappable input (e.g. "rate your professional" on a completed
 * booking — all grey until the user taps). Tokenised.
 */
export const StarRating = forwardRef<ViewType, StarRatingProps>(function StarRating(
  { value = 0, max = 5, size = 'md', onRate, style, ...rest },
  ref,
) {
  const t = useTheme();
  const interactive = !!onRate;

  return (
    <View
      ref={ref}
      accessibilityRole={interactive ? undefined : 'image'}
      accessibilityLabel={interactive ? undefined : `Rated ${value} of ${max}`}
      style={[{ flexDirection: 'row', gap: t.size['4'] }, style]}
      {...rest}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < value;
        // Empty stars are a soft light grey (border.default); filled take the rating gold.
        const color = filled ? t.background.rating : t.border.default;
        const star = <Icon name="star" size={size} color={color} fill={color} />;
        return interactive ? (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${i + 1} of ${max}`}
            hitSlop={t.size['4']}
            onPress={() => onRate?.(i + 1)}
          >
            {star}
          </Pressable>
        ) : (
          <View key={i}>{star}</View>
        );
      })}
    </View>
  );
});
