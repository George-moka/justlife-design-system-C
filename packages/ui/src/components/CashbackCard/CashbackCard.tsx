import React, { forwardRef } from 'react';
import { View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';
import { Button } from '../Button';

export interface CashbackCardProps extends Omit<ViewProps, 'children'> {
  /** Heading, e.g. "Cashback - Home Cleaning". */
  title: string;
  /** Credit amount, e.g. "35.00". */
  amount: string | number;
  /** Currency label shown before the amount. */
  currency?: string;
  /** Terms / usage note. Hidden when omitted. */
  description?: string;
  /** Expiry note, e.g. "Expires on Jun 28, 2022". Shown in the error colour. */
  expiry?: string;
  /** Toggles the Applied state (selected styling + outline button). */
  applied?: boolean;
  onApply?: () => void;
  applyLabel?: string;
  appliedLabel?: string;
}

/**
 * Promotional cashback/credit card (Figma "Cashback Card", states Default /
 * Applied). Header (title + amount), optional terms, and an expiry + Apply row.
 * Applied state adopts the selected styling and an outline button. Tokenised.
 */
export const CashbackCard = forwardRef<ViewType, CashbackCardProps>(function CashbackCard(
  {
    title,
    amount,
    currency = 'AED',
    description,
    expiry,
    applied = false,
    onApply,
    applyLabel = 'Apply',
    appliedLabel = 'Applied',
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();

  return (
    <VStack
      ref={ref}
      gap="sm"
      style={[
        {
          width: '100%',
          backgroundColor: applied ? t.background.selected : t.background.surface,
          borderRadius: t.radius.default,
          borderWidth: t.borderWidth.thin,
          borderColor: applied ? t.border.brandDefault : t.border.default,
          padding: t.space.sm,
        },
        style,
      ]}
      {...rest}
    >
      <HStack justify="space-between" align="center" gap="sm">
        <Text variant="titleSmall" numberOfLines={1} style={{ flex: 1 }}>
          {title}
        </Text>
        <Text variant="titleMedium">
          {currency} {amount}
        </Text>
      </HStack>

      {description ? (
        <Text variant="bodyXSmall" color="secondary" numberOfLines={3}>
          {description}
        </Text>
      ) : null}

      <HStack justify="space-between" align="center" gap="sm">
        {expiry ? (
          <HStack gap="xs" align="center" style={{ flex: 1 }}>
            <Icon name="clock" size="sm" color={t.text.error} />
            <Text variant="bodyXSmall" color="error" numberOfLines={1}>
              {expiry}
            </Text>
          </HStack>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <Button size="xs" variant={applied ? 'outline' : 'primary'} onPress={onApply}>
          {applied ? appliedLabel : applyLabel}
        </Button>
      </HStack>
    </VStack>
  );
});
