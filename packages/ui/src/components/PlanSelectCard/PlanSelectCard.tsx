import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { HStack, VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Badge } from '../Badge';
import { Radio } from '../Radio';
import { SelectableCard } from '../SelectableCard';

export interface PlanSelectCardProps {
  selected: boolean;
  onPress: () => void;
  /** Plan name, e.g. "Recurring". */
  title: string;
  /** Optional discount badge beside the title (e.g. "Save up to 25%"). */
  discount?: string;
  /** Seat a "Most Popular" ribbon on the top-left edge (mostly on the card, slight overhang). */
  popular?: boolean;
  /** Benefit bullets. */
  bullets: string[];
  /** Optional expanded content shown when selected (e.g. recurring cadence + weekday picker). */
  children?: ReactNode;
}

/**
 * **PlanSelectCard** — a vertical, selectable **plan card**: title (with an optional inline discount badge), a radio
 * indicator, a divider, benefit bullets, and optional expanded content. Composes `SelectableCard` for the
 * selectable shell (selected fill + brand border + press), so it stays consistent with every other
 * selectable card. The "Most Popular" ribbon is seated on the top-left edge. Used for the booking funnel’s
 * frequency choice (One Time / Recurring / Monthly).
 */
export function PlanSelectCard({ selected, onPress, title, discount, popular, bullets, children }: PlanSelectCardProps) {
  const t = useTheme();
  return (
    // No top margin for the ribbon — it overhangs into the (equal) gap above as an absolute overlay, so
    // cards stay equally spaced (equal-size-rows).
    <View>
      {popular ? (
        // Seated on the top edge — mostly ON the card with a small 4px overhang into the gap, so it reads
        // attached (not floating over the corner). Matches the Wallet PackageTile chip. Absolute → it never
        // changes the card height (equal-size-rows).
        <Badge tone="brand" style={{ position: 'absolute', top: -t.size['4'], left: t.space.md, zIndex: 1 }}>
          Most Popular
        </Badge>
      ) : null}
      <SelectableCard selected={selected} onPress={onPress} accessibilityLabel={title}>
        {/* One full-width column child fills SelectableCard's row. The static part is gapped; the expansion
            sits OUTSIDE that gap so collapsed it adds zero height (cards stay equal) and supplies its own
            top padding when open. */}
        <View style={{ flex: 1 }}>
          <VStack gap="sm">
            <HStack justify="space-between" align="center" gap="sm">
              {/* Title + discount sit on ONE row (not stacked) so a card WITH a discount is the same
                  height as one without — the badge no longer adds a line (equal-size-rows). */}
              <HStack gap="sm" align="center" style={{ flex: 1 }}>
                <Text variant="titleSmall" style={{ flexShrink: 1 }}>
                  {title}
                </Text>
                {/* alignSelf:center overrides Badge's intrinsic flex-start so the pill centres on the title's
                    optical line (it was top-aligned, riding a few px high). */}
                {discount ? (
                  <Badge tone="success" style={{ alignSelf: 'center' }}>
                    {discount}
                  </Badge>
                ) : null}
              </HStack>
              {/* Visual only — the whole card is the press/select target, so the radio is decorative. */}
              <Radio selected={selected} size="md" interactive={false} />
            </HStack>
            <View style={{ height: t.borderWidth.hairline, backgroundColor: t.divider.color.default }} />
            {/* Card body copy is `bodyXSmall` (11) everywhere in the app — a service description, a
                Book Again line, a product blurb. These bullets sat at `bodyBase` (13), one step up,
                which made the whole Frequency step read larger than Home and the salon funnel. */}
            <VStack gap="xs">
              {bullets.map((b) => (
                <HStack key={b} gap="sm" align="flex-start">
                  <Text variant="bodyXSmall" color="primary" style={{ marginTop: t.size['2'] }}>
                    •
                  </Text>
                  <Text variant="bodyXSmall" color="primary" style={{ flex: 1 }}>
                    {b}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
          {children}
        </View>
      </SelectableCard>
    </View>
  );
}
