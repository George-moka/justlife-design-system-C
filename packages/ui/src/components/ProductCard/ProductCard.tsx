import React, { forwardRef, type ReactNode } from 'react';
import { View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useControllableState } from '../../hooks/useControllableState';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Button } from '../Button';
import { QuantityStepper } from '../QuantityStepper/QuantityStepper';

export interface ProductCardProps extends Omit<ViewProps, 'children'> {
  title: string;
  description?: string;
  price: string | number;
  oldPrice?: string | number;
  currency?: string;
  /** Image for the 152×100 top slot. */
  image?: ReactNode;
  quantity?: number;
  defaultQuantity?: number;
  max?: number;
  onQuantityChange?: (quantity: number) => void;
  addLabel?: string;
}

/**
 * Vertical product card (Figma Product Card). Image + title + description +
 * price; an Add button that becomes the QuantityStepper once added. The card
 * adopts the Selected (brand) styling while added. Type/colours tokenised.
 */
export const ProductCard = forwardRef<ViewType, ProductCardProps>(function ProductCard(
  {
    title,
    description,
    price,
    oldPrice,
    currency = 'AED',
    image,
    quantity,
    defaultQuantity = 0,
    max,
    onQuantityChange,
    addLabel = 'Add',
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const [qty, setQty] = useControllableState(quantity, defaultQuantity);
  const added = qty > 0;
  const update = (next: number) => {
    setQty(next);
    onQuantityChange?.(next);
  };

  return (
    <View
      ref={ref}
      style={[
        {
          width: 152,
          borderRadius: t.radius.default,
          borderWidth: t.borderWidth.thin,
          borderColor: added ? t.border.brandDefault : t.border.default,
          backgroundColor: added ? t.background.selected : t.background.surface,
          overflow: 'hidden',
          paddingBottom: t.space.sm,
          gap: t.space.sm,
        },
        style,
      ]}
      {...rest}
    >
      <View style={{ width: '100%', height: 100, backgroundColor: t.background.tertiary }}>{image}</View>
      <VStack gap="xs" style={{ width: '100%', paddingHorizontal: t.space.sm }}>
        <Text variant="labelXSmall" numberOfLines={1}>
          {title}
        </Text>
        {description ? (
          <Text variant="bodyXSmall" color="secondary" numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        <HStack gap="xs" align="center">
          <Text variant="labelXSmall">
            {currency} {price}
          </Text>
          {oldPrice != null ? (
            <Text variant="bodyXSmall" color="secondary" style={{ textDecorationLine: 'line-through' }}>
              {currency} {oldPrice}
            </Text>
          ) : null}
        </HStack>
      </VStack>
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center' }}>
        {added ? (
          <QuantityStepper size="sm" value={qty} min={1} max={max} onChange={update} />
        ) : (
          <Button size="2xs" onPress={() => update(1)}>
            {addLabel}
          </Button>
        )}
      </View>
    </View>
  );
});
