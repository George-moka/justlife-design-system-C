import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useControllableState } from '../../hooks/useControllableState';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { QuantityStepper } from '../QuantityStepper/QuantityStepper';

export type ServiceCardCta = 'add' | 'select';

export interface ServiceCardDetails {
  heading?: string;
  editLabel?: string;
  onEdit?: () => void;
  /** Included items, rendered as a bullet list. */
  items: string[];
}

export interface ServiceCardProps extends Omit<ViewProps, 'children'> {
  title: string;
  /** Image for the 64×64 media slot. */
  image?: ReactNode;
  /** Purple "options" tag shown under the image (e.g. "5 options"). */
  optionsTag?: string;
  /** Duration meta, e.g. "120 min" (shown with a clock icon). */
  duration?: string;
  description?: string;
  price: string | number;
  /** Strikethrough original price. */
  oldPrice?: string | number;
  currency?: string;
  /** Discount badge, e.g. "20% off". */
  discountLabel?: string;
  /** Trailing control: Add button, quantity stepper, or a Select button. */
  cta?: ServiceCardCta;
  addLabel?: string;
  selectLabel?: string;
  /** Selected styling (and shows the quantity prefix on the title). */
  selected?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
  /** Stepper / quantity state (cta="stepper"). */
  quantity?: number;
  defaultQuantity?: number;
  max?: number;
  onQuantityChange?: (quantity: number) => void;
  onAdd?: () => void;
  onSelect?: () => void;
  /** Optional "what's included" details panel. */
  details?: ServiceCardDetails;
}

const MEDIA = 64;

/**
 * Service listing card (Figma "Service Card") — the primary services building
 * block. Media + options tag, title/duration/description, a price row with an
 * optional discount badge, a CTA (Add / Stepper / Select), a Selected state,
 * and an optional included-items panel. Colours and type are tokenised;
 * spacing snaps to the scale.
 */
export const ServiceCard = forwardRef<ViewType, ServiceCardProps>(function ServiceCard(
  {
    title,
    image,
    optionsTag,
    duration,
    description,
    price,
    oldPrice,
    currency = 'AED',
    discountLabel,
    cta = 'add',
    addLabel = 'Add',
    selectLabel = 'Select',
    selected = false,
    showChevron = false,
    onPress,
    quantity,
    defaultQuantity = 0,
    max,
    onQuantityChange,
    onAdd,
    onSelect,
    details,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const [qty, setQty] = useControllableState(quantity, defaultQuantity);
  const updateQty = (next: number) => {
    setQty(next);
    onQuantityChange?.(next);
  };

  const added = qty > 0;
  const trailing =
    cta === 'select' ? (
      <Button size="xs" variant="outline" onPress={onSelect}>
        {selectLabel}
      </Button>
    ) : added ? (
      <QuantityStepper size="sm" value={qty} min={1} max={max} onChange={updateQty} />
    ) : (
      <Button
        size="2xs"
        onPress={() => {
          updateQty(1);
          onAdd?.();
        }}
      >
        {addLabel}
      </Button>
    );

  return (
    <VStack
      ref={ref}
      gap="sm"
      style={[
        {
          width: '100%',
          backgroundColor: selected ? t.background.selected : t.background.surface,
          borderRadius: t.radius.xl,
          // 12 matches the Figma card padding; off the t-shirt scale so it uses the size.12 primitive.
          padding: t.size['12'],
        },
        style,
      ]}
      {...rest}
    >
      <HStack gap="sm" align="flex-start">
        <VStack gap="xs" align="center">
          <View
            style={{
              width: MEDIA,
              height: MEDIA,
              borderRadius: t.radius.md,
              backgroundColor: t.background.tertiary,
              overflow: 'hidden',
            }}
          >
            {image}
          </View>
          {optionsTag ? (
            <View style={{ backgroundColor: t.background.options, borderRadius: t.radius.sm, paddingHorizontal: t.space.xs, paddingVertical: t.size['2'] }}>
              <Text variant="labelXXSmall" style={{ color: t.badge.text.inverse }}>
                {optionsTag}
              </Text>
            </View>
          ) : null}
        </VStack>

        <VStack gap="xs" style={{ flex: 1 }}>
          <HStack justify="space-between" align="center" gap="sm">
            <Text variant="titleSmall" numberOfLines={1} style={{ flex: 1 }}>
              {title}
            </Text>
            {showChevron ? (
              <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress}>
                <Icon name="chevron-right" size="sm" color={t.icon.secondary} />
              </Pressable>
            ) : null}
          </HStack>

          {duration ? (
            <HStack gap="xs" align="center">
              <Icon name="clock" size="sm" color={t.icon.secondary} />
              <Text variant="bodyXSmall" color="secondary">
                {duration}
              </Text>
            </HStack>
          ) : null}

          {description ? (
            <Text variant="bodyXSmall" color="secondary" numberOfLines={2}>
              {description}
            </Text>
          ) : null}

          <HStack justify="space-between" align="center" gap="sm">
            <HStack gap="sm" align="center" style={{ flexShrink: 1 }}>
              <Text variant="labelBase">
                {currency} {price}
              </Text>
              {oldPrice != null ? (
                <Text variant="bodyBase" color="disabled" style={{ textDecorationLine: 'line-through' }}>
                  {currency} {oldPrice}
                </Text>
              ) : null}
              {discountLabel ? <Badge tone="success">{discountLabel}</Badge> : null}
            </HStack>
            {trailing}
          </HStack>
        </VStack>
      </HStack>

      {details ? (
        <VStack
          gap="xs"
          style={{
            backgroundColor: t.background.primary,
            borderRadius: t.radius.default,
            padding: t.space.md,
          }}
        >
          <HStack justify="space-between" align="center" gap="sm">
            <Text variant="labelXSmall">{details.heading ?? 'What is included'}</Text>
            {details.editLabel ? (
              <Pressable accessibilityRole="button" accessibilityLabel={details.editLabel} onPress={details.onEdit}>
                <Text variant="labelXSmall" style={{ color: t.text.link }}>
                  {details.editLabel}
                </Text>
              </Pressable>
            ) : null}
          </HStack>
          {details.items.map((item, i) => (
            <Text key={i} variant="bodyXSmall" color="secondary">
              {`• ${item}`}
            </Text>
          ))}
        </VStack>
      ) : null}
    </VStack>
  );
});
