import React, { forwardRef } from 'react';
import { type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';
import { Button } from '../Button';

export interface RatedCardProps extends Omit<ViewProps, 'children'> {
  /** Heading, e.g. "You Rated Leila". */
  title: string;
  /** Leading icon for the title row (Lucide name). */
  icon?: string;
  /** Label before the stars, e.g. "Your rating". */
  ratingLabel?: string;
  /** Rating value 0–5; that many stars render filled. */
  rating?: number;
  /** Label before the tip amount/button, e.g. "Tip added". */
  tipLabel?: string;
  /** When set, renders the "Tip" state showing the given amount. */
  tipAmount?: string | number;
  /** Currency label shown before the tip amount. */
  currency?: string;
  /** When set (and no `tipAmount`), renders the "Add Tip" state with a button. */
  onAddTip?: () => void;
  /** Label for the Add Tip button. */
  addTipLabel?: string;
}

const STARS = 5;

/**
 * Post-service rating card (Figma "Rated Card", states Default / Tip / Add Tip).
 * Title row + a five-star rating row, plus an optional tip row that either shows
 * the tip amount or an "Add Tip" button. Colours and type are tokenised.
 */
export const RatedCard = forwardRef<ViewType, RatedCardProps>(function RatedCard(
  {
    title,
    icon = 'star',
    ratingLabel = 'Your rating',
    rating = STARS,
    tipLabel,
    tipAmount,
    currency = 'AED',
    onAddTip,
    addTipLabel = 'Add Tip',
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const filled = Math.max(0, Math.min(STARS, Math.round(rating)));
  const showTip = tipAmount != null;
  const showAddTip = !showTip && onAddTip != null;

  return (
    <VStack
      ref={ref}
      gap="sm"
      style={[
        {
          width: '100%',
          backgroundColor: t.background.surface,
          borderRadius: t.radius.default,
          padding: t.space.sm,
        },
        style,
      ]}
      {...rest}
    >
      <HStack gap="xs" align="center">
        <Icon name={icon} size="sm" />
        <Text variant="titleSmall">{title}</Text>
      </HStack>

      <HStack justify="space-between" align="center">
        <Text variant="bodyBase" color="secondary">
          {ratingLabel}
        </Text>
        <HStack
          gap="xs"
          align="center"
          accessibilityRole="image"
          accessibilityLabel={`${filled} out of ${STARS} stars`}
        >
          {Array.from({ length: STARS }, (_, i) => (
            <Icon
              key={i}
              name="star"
              size="md"
              color={t.background.rating}
              fill={i < filled ? t.background.rating : 'none'}
            />
          ))}
        </HStack>
      </HStack>

      {showTip ? (
        <HStack justify="space-between" align="center">
          <Text variant="bodyBase" color="secondary">
            {tipLabel ?? 'Tip added'}
          </Text>
          <Text variant="titleSmall">
            {currency} {tipAmount}
          </Text>
        </HStack>
      ) : null}

      {showAddTip ? (
        <HStack justify="space-between" align="center">
          <Text variant="bodyBase" color="secondary">
            {tipLabel ?? 'Add a tip'}
          </Text>
          <Button size="xs" onPress={onAddTip}>
            {addTipLabel}
          </Button>
        </HStack>
      ) : null}
    </VStack>
  );
});
