import React, { forwardRef } from 'react';
import { Pressable, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';
import { Badge } from '../Badge';

export interface VoucherCodeCardProps extends Omit<ViewProps, 'children'> {
  title?: string;
  /** Toggles the Applied state (entered code + discount + remove). */
  applied?: boolean;
  /** Applied voucher code, e.g. "BOTIM432". */
  code?: string;
  /** Discount badge text shown when applied, e.g. "20% off". */
  discountLabel?: string;
  /** Default-state link label. */
  addLabel?: string;
  /** Applied-state details link label. */
  detailsLabel?: string;
  onAdd?: () => void;
  onRemove?: () => void;
  onDetails?: () => void;
}

/**
 * Voucher / promo code card (Figma "Voucher Code Card", states Default /
 * Applied). Default shows an Add link; Applied shows the code with a discount
 * badge, a remove control, and a details link, in the selected styling.
 */
export const VoucherCodeCard = forwardRef<ViewType, VoucherCodeCardProps>(function VoucherCodeCard(
  {
    title = 'Voucher Code',
    applied = false,
    code,
    discountLabel,
    addLabel = 'Add',
    detailsLabel = 'Details',
    onAdd,
    onRemove,
    onDetails,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();

  const cardStyle = [
    {
      width: '100%' as const,
      backgroundColor: applied ? t.background.selected : t.background.surface,
      borderRadius: t.radius.default,
      borderWidth: applied ? t.borderWidth.thin : 0,
      borderColor: t.border.brandDefault,
      padding: t.space.sm,
    },
    style,
  ];

  if (!applied) {
    return (
      <HStack ref={ref} justify="space-between" align="center" gap="sm" style={cardStyle} {...rest}>
        <Text variant="titleSmall" numberOfLines={1} style={{ flexShrink: 1 }}>
          {title}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel={addLabel} onPress={onAdd}>
          <HStack gap="xs" align="center">
            <Icon name="plus" size="sm" color={t.text.link} />
            <Text variant="labelXSmall" style={{ color: t.text.link }}>
              {addLabel}
            </Text>
          </HStack>
        </Pressable>
      </HStack>
    );
  }

  return (
    <VStack ref={ref} gap="xs" style={cardStyle} {...rest}>
      <HStack justify="space-between" align="center" gap="sm">
        <Text variant="titleSmall" numberOfLines={1} style={{ flexShrink: 1 }}>
          {title}
        </Text>
        <HStack gap="sm" align="center">
          {discountLabel ? <Badge tone="success">{discountLabel}</Badge> : null}
          <Pressable accessibilityRole="button" accessibilityLabel="Remove voucher" onPress={onRemove}>
            <Icon name="x" size="sm" color={t.icon.secondary} />
          </Pressable>
        </HStack>
      </HStack>
      <HStack justify="space-between" align="center" gap="sm">
        <Text variant="labelXSmall" numberOfLines={1} style={{ flexShrink: 1 }}>
          {code}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel={detailsLabel} onPress={onDetails}>
          <Text variant="labelXSmall" style={{ color: t.text.link }}>
            {detailsLabel}
          </Text>
        </Pressable>
      </HStack>
    </VStack>
  );
});
