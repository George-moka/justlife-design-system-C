import React, { forwardRef } from 'react';
import { View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { VStack } from '../../primitives/Stack';
import { LinearGradient } from '../../primitives/LinearGradient';
import { Button } from '../Button';
import { Badge } from '../Badge';

export interface CreditPackageCardProps extends Omit<ViewProps, 'children'> {
  /** Tier name, e.g. "BASIC". */
  tier: string;
  /** Savings badge text, e.g. "Save 33%". Hidden when omitted. */
  saveLabel?: string;
  /** Label above the pay amount. */
  payLabel?: string;
  /** Amount the customer pays, e.g. "250". */
  pay: string | number;
  /** Label above the get amount. */
  getLabel?: string;
  /** Credit the customer receives, e.g. "375". */
  get: string | number;
  /** Validity note, e.g. "60 day validity.". */
  validity?: string;
  /** Currency label shown before amounts. */
  currency?: string;
  /** Buy button label. */
  buyLabel?: string;
  onBuy?: () => void;
}

const WIDTH = 180;

/**
 * Credit package / pricing-tier card (Figma "Credit Package Card", tiers
 * Basic / Smart / Super). Brand gradient background, a savings badge, pay/get
 * amounts split by a divider, validity, and a secondary Buy button. Colours and
 * type are tokenised; the gradient stops use brand tokens.
 */
export const CreditPackageCard = forwardRef<ViewType, CreditPackageCardProps>(function CreditPackageCard(
  {
    tier,
    saveLabel,
    payLabel = 'Pay',
    pay,
    getLabel = 'Get',
    get,
    validity,
    currency = 'AED',
    buyLabel = 'Buy',
    onBuy,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();

  return (
    <LinearGradient
      colors={[t.background.brandSubtle, t.background.brandDefault]}
      style={[{ width: WIDTH, borderRadius: t.radius.default }, style]}
    >
      <VStack ref={ref} gap="sm" align="center" style={{ width: '100%', padding: t.space.sm }} {...rest}>
        <Text variant="titleSmall">{tier}</Text>

        {saveLabel ? <Badge tone="success">{saveLabel}</Badge> : null}

        <Text variant="bodyXSmall" color="secondary">
          {payLabel}
        </Text>
        <Text variant="titleMedium" color="secondary">
          {currency} {pay}
        </Text>

        <View style={{ height: t.borderWidth.thin, alignSelf: 'stretch', backgroundColor: t.border.default }} />

        <Text variant="bodyXSmall" color="secondary">
          {getLabel}
        </Text>
        <Text variant="titleLarge">
          {currency} {get}
        </Text>

        {validity ? (
          <Text variant="bodyXSmall" color="secondary">
            {validity}
          </Text>
        ) : null}

        <Button size="xs" variant="secondary" onPress={onBuy}>
          {buyLabel}
        </Button>
      </VStack>
    </LinearGradient>
  );
});
