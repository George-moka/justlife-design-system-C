import React, { forwardRef, type ReactNode } from 'react';
import { View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { VStack } from '../../primitives/Stack';
import { Radio } from '../Radio';
import { SelectableCard } from '../SelectableCard';

export interface PaymentMethodCardProps extends Omit<ViewProps, 'children'> {
  /** Brand / method icon — a Lucide `<Icon>` (credit-card, banknote) or a brand logo. */
  icon?: ReactNode;
  title: string;
  /** Masked card number / subtitle, e.g. "•••• 4242". */
  number?: string;
  /** Trailing label, e.g. "Default" (status) or "Change" (action). Ignored when `selected` is set. */
  trailing?: string;
  /** Trailing label tone: `muted` = secondary status (default); `action` = link-coloured CTA. */
  trailingTone?: 'muted' | 'action';
  /** When set, switches to selectable mode: shows a radio + selected styling. */
  selected?: boolean;
  /**
   * Surface treatment for the unselected state. `false` (default) → white `surface` (raised, sits on
   * the page canvas); `true` → `secondary` (recessed — for cards nested inside a white surface such as
   * a `BottomSheet`). Ignored while `selected` (selected always uses the brand tint).
   */
  recessed?: boolean;
  onPress?: () => void;
}

/**
 * Payment method row (Figma "Payment Method Card"). Leading brand/method icon,
 * a title with an optional masked number, and a trailing label. Built on the
 * shared `SelectableCard` shell; the icon is a slot so brand logos plug in.
 */
export const PaymentMethodCard = forwardRef<ViewType, PaymentMethodCardProps>(function PaymentMethodCard(
  { icon, title, number, trailing, trailingTone = 'muted', selected, recessed = false, onPress, style, ...rest },
  ref,
) {
  const t = useTheme();
  const selectable = selected !== undefined;

  return (
    <SelectableCard
      ref={ref}
      selected={selected}
      onPress={onPress}
      accessibilityLabel={title}
      background={recessed ? t.background.secondary : t.background.surface}
      padding={t.size['12']}
      // Fixed row height so single-line rows (Cash) match two-line rows (Visa •••• 4242).
      minHeight={t.size['56']}
      // Bordered when it's a radio row (selectable) or an actionable/labelled row (has `trailing`);
      // a bare display row stays borderless.
      border={selectable || trailing ? 'always' : 'whenSelectable'}
      style={style}
      {...rest}
    >
      {/* Fixed-width slot so titles line up across stacked rows regardless of logo width. */}
      <View style={{ width: 40, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <VStack style={{ flex: 1, gap: t.size['2'] }}>
        <Text variant="labelXSmall" numberOfLines={1}>
          {title}
        </Text>
        {number ? (
          <Text variant="bodyXSmall" color="secondary" numberOfLines={1}>
            {number}
          </Text>
        ) : null}
      </VStack>
      {selectable ? (
        <View pointerEvents="none">
          <Radio selected={selected} accessibilityLabel={title} />
        </View>
      ) : trailing ? (
        <Text variant="labelXSmall" color={trailingTone === 'action' ? 'link' : 'secondary'}>
          {trailing}
        </Text>
      ) : null}
    </SelectableCard>
  );
});
