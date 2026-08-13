import React from 'react';
import { HStack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Dirham } from '../components/Dirham';

/**
 * Money, the way the funnels write it. Lives on its own so the salon screen and the pieces it composes
 * (the combo card + its sheet) can share one renderer without importing each other — a screen importing
 * a screen is how the rebooking sheet once crashed the Storybook build.
 */

/** Whole dirhams stay whole; anything with fils shows both. */
export const money = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

export type PriceVariant =
  | 'labelBase'
  | 'labelMedium'
  | 'labelXSmall'
  | 'bodyXSmall'
  | 'titleMedium';

/** Dirham symbol + amount, sized/coloured together (#44 — the symbol is text, same size as its digits). */
export function Price({
  amount,
  variant = 'labelBase',
  color = 'primary',
  strike,
  prefix,
}: {
  amount: number;
  variant?: PriceVariant;
  color?: 'primary' | 'secondary' | 'tertiary';
  strike?: boolean;
  /** A leading run in the same type (the options sheet's "+"). */
  prefix?: string;
}) {
  const strikeStyle = strike ? ({ textDecorationLine: 'line-through' } as const) : undefined;
  return (
    // `gap="none"` — the symbol and its digits are ONE money token. (HStack DEFAULTS to an 8px gap, so
    // simply dropping the gap prop would have widened it.)
    <HStack gap="none" align="center">
      {prefix ? (
        <Text variant={variant} color={color} style={strikeStyle}>
          {prefix}
        </Text>
      ) : null}
      <Dirham variant={variant} color={color} style={strikeStyle} />
      <Text variant={variant} color={color} style={strikeStyle}>
        {money(amount)}
      </Text>
    </HStack>
  );
}
