import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { QuantityStepper } from '../QuantityStepper/QuantityStepper';

export interface AddOnsCardProps extends Omit<ViewProps, 'children'> {
  title: string;
  price: string | number;
  /** Strikethrough original price. */
  oldPrice?: string | number;
  /** Currency label shown before prices. */
  currency?: string;
  /** Image for the 116×100 top slot. */
  image?: ReactNode;
  /** Show the "Learn More" link (default true). */
  showLearnMore?: boolean;
  learnMoreLabel?: string;
  onLearnMore?: () => void;
  quantity?: number;
  defaultQuantity?: number;
  max?: number;
  onQuantityChange?: (quantity: number) => void;
}

const IMAGE_HEIGHT = 100;

/**
 * Add-on tile (Figma "Add-ons Card"). Fills its container width (place it in a grid column or a
 * fixed-width wrapper) with an image, a floating add control overlaid on the image (a `+` that
 * becomes a quantity stepper once added), a title, an optional Learn More link, and a price row.
 * Tokenised.
 */
export const AddOnsCard = forwardRef<ViewType, AddOnsCardProps>(function AddOnsCard(
  {
    title,
    price,
    oldPrice,
    currency = 'AED',
    image,
    showLearnMore = true,
    learnMoreLabel = 'Learn More',
    onLearnMore,
    quantity,
    defaultQuantity = 0,
    max,
    onQuantityChange,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();

  return (
    <View
      ref={ref}
      style={[
        {
          width: '100%',
          borderRadius: t.radius.default,
          backgroundColor: t.background.surface,
          overflow: 'hidden',
          paddingBottom: t.space.sm,
          gap: t.space.sm,
        },
        style,
      ]}
      {...rest}
    >
      <View style={{ width: '100%', height: IMAGE_HEIGHT, backgroundColor: t.background.tertiary }}>
        {image}
        <View style={{ position: 'absolute', bottom: t.space.sm, right: t.space.sm }}>
          <QuantityStepper
            size="sm"
            value={quantity}
            defaultValue={defaultQuantity}
            min={1}
            max={max}
            onChange={onQuantityChange}
          />
        </View>
      </View>

      <VStack gap="xs" style={{ paddingHorizontal: t.space.sm }}>
        <Text variant="labelXSmall" numberOfLines={1}>
          {title}
        </Text>
        {showLearnMore ? (
          <Pressable accessibilityRole="button" accessibilityLabel={learnMoreLabel} onPress={onLearnMore}>
            <Text variant="labelXSmall" style={{ color: t.text.link }}>
              {learnMoreLabel}
            </Text>
          </Pressable>
        ) : null}
        <HStack gap="xs" align="center">
          {oldPrice != null ? (
            <Text variant="bodyXSmall" color="secondary" style={{ textDecorationLine: 'line-through' }}>
              {currency} {oldPrice}
            </Text>
          ) : null}
          <Text variant="labelXSmall">
            {currency} {price}
          </Text>
        </HStack>
      </VStack>
    </View>
  );
});
