import React, { forwardRef } from 'react';
import { type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';
import type { TextProps } from '../../primitives/Text';

export type RatingSummarySize = 'sm' | 'md' | 'lg';

export interface RatingSummaryProps extends Omit<ViewProps, 'children'> {
  /** Average rating, e.g. "4.88". */
  rating: number | string;
  /** Review count label, e.g. "27K reviews". Hidden when omitted. */
  reviewCount?: string;
  size?: RatingSummarySize;
  /** Show the leading star (default true). */
  showStar?: boolean;
}

const SIZES: Record<RatingSummarySize, { rating: TextProps['variant']; count: TextProps['variant'] }> = {
  sm: { rating: 'titleLarge', count: 'bodyXSmall' },
  md: { rating: 'headlineSmall', count: 'bodyXSmall' },
  lg: { rating: 'headlineMedium', count: 'bodyMedium' },
};

/**
 * Aggregate rating metric (Figma "Rating Summary", sizes Small / Medium /
 * Large): a star + average rating with an optional review count beneath.
 * Colours and type are tokenised.
 */
export const RatingSummary = forwardRef<ViewType, RatingSummaryProps>(function RatingSummary(
  { rating, reviewCount, size = 'md', showStar = true, style, ...rest },
  ref,
) {
  const t = useTheme();
  const s = SIZES[size];

  return (
    <VStack ref={ref} gap="xs" style={[{ alignSelf: 'flex-start' }, style]} {...rest}>
      <HStack gap="xs" align="center">
        {showStar ? <Icon name="star" size="lg" color={t.background.rating} fill={t.background.rating} /> : null}
        <Text variant={s.rating}>{rating}</Text>
      </HStack>
      {reviewCount ? (
        <Text variant={s.count} color="secondary">
          {reviewCount}
        </Text>
      ) : null}
    </VStack>
  );
});
