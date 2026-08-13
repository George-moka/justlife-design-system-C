import React, { forwardRef } from 'react';
import { type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useControllableState } from '../../hooks/useControllableState';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Button } from '../Button';
import { QuantityStepper } from '../QuantityStepper/QuantityStepper';

export interface FlexCardProps extends Omit<ViewProps, 'children'> {
  title: string;
  price: string | number;
  /** Strikethrough original price. */
  oldPrice?: string | number;
  /** Currency label shown before the price. */
  currency?: string;
  quantity?: number;
  defaultQuantity?: number;
  max?: number;
  onQuantityChange?: (quantity: number) => void;
  /** Label for the collapsed add control (Default state). */
  addLabel?: string;
}

/**
 * Compact product/combo row (Figma Flex Card). Default shows an Add button;
 * once added it shows an inline stepper. Colours tokenised.
 */
export const FlexCard = forwardRef<ViewType, FlexCardProps>(function FlexCard(
  {
    title,
    price,
    oldPrice,
    currency = 'AED',
    quantity,
    defaultQuantity = 0,
    max = Number.POSITIVE_INFINITY,
    onQuantityChange,
    addLabel = 'Add',
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const [qty, setQty] = useControllableState(quantity, defaultQuantity);

  const update = (next: number) => {
    setQty(next);
    onQuantityChange?.(next);
  };

  const trailing =
    qty <= 0 ? (
      <Button size="2xs" onPress={() => update(1)}>
        {addLabel}
      </Button>
    ) : (
      <QuantityStepper size="sm" value={qty} min={1} max={max} onChange={update} />
    );

  return (
    <HStack
      ref={ref}
      align="center"
      justify="space-between"
      gap="sm"
      style={[
        {
          width: '100%',
          backgroundColor: t.background.surface,
          borderRadius: t.radius.default,
          paddingHorizontal: t.space.sm,
          paddingVertical: t.space.sm,
        },
        style,
      ]}
      {...rest}
    >
      <VStack gap="xs" style={{ flexShrink: 1 }}>
        <Text variant="titleSmall" numberOfLines={1}>
          {title}
        </Text>
        <HStack gap="xs" align="center">
          <Text variant="bodyBase">
            {currency} {price}
          </Text>
          {oldPrice != null ? (
            <Text variant="bodyXSmall" color="secondary" style={{ textDecorationLine: 'line-through' }}>
              {currency} {oldPrice}
            </Text>
          ) : null}
        </HStack>
      </VStack>
      {trailing}
    </HStack>
  );
});
