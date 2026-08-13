import React, { forwardRef } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';
import { PaymentLogo, type PaymentLogoName } from '../PaymentMethodCard';

export interface PriceDetailsRow {
  label: string;
  /** Pre-formatted amount (the consumer includes any currency — the AED glyph is a parked asset). */
  value: string;
  /** `success` renders the amount in the savings/discount green (`icon.success`). */
  tone?: 'default' | 'success';
  /** Show an info (ⓘ) icon after the label (e.g. an explainable fee). */
  info?: boolean;
}

export interface PriceDetailsPayment {
  label: string;
  value: string;
  /** Card / wallet brand logo shown before the value. */
  logo?: PaymentLogoName;
}

export interface PriceDetailsFooter {
  label: string;
  onPress?: () => void;
}

export interface PriceDetailsProps extends Omit<ViewProps, 'children'> {
  /** Heading; defaults to "Price Details". Pass `null` to hide it. */
  title?: string | null;
  /** Breakdown line items (subtotal, discounts, fees…). */
  rows: PriceDetailsRow[];
  /** Total row, rendered after the divider. */
  total: PriceDetailsRow;
  /** Optional payment-method row (with a brand logo). */
  paymentMethod?: PriceDetailsPayment;
  /** Optional tappable receipt footer. */
  footer?: PriceDetailsFooter;
  /** Render flat (transparent, no card surface/radius/padding) for embedding inside another surface. */
  embedded?: boolean;
}

/**
 * Price Details (Figma "Price Details"). A checkout bill: a titled card of label/amount rows
 * (discounts in the success green, fees with an optional info icon), a divider, a total, an
 * optional payment-method row (composing `PaymentLogo`), and an optional tappable receipt footer.
 * Amounts are pre-formatted strings (the AED currency glyph is a parked custom asset). Tokenised.
 */
export const PriceDetails = forwardRef<ViewType, PriceDetailsProps>(function PriceDetails(
  { title = 'Price Details', rows, total, paymentMethod, footer, embedded = false, style, ...rest },
  ref,
) {
  const t = useTheme();

  // The total is emphasised (semibold + primary label) so the bill's bottom line stands out from the
  // regular `bodyXSmall` rows. As a standalone card it steps up to `labelBase` (13) for prominence; when
  // `embedded` in another surface (e.g. the CheckoutBar) it stays at the row size (`labelXSmall`, 11) so it
  // doesn't shout inside the compact bar — same semibold weight either way, only the size differs.
  const totalVariant = embedded ? 'labelXSmall' : 'labelBase';
  const renderRow = (r: PriceDetailsRow, key: React.Key, emphasized = false) => (
    <View key={key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.size['4'] }}>
        <Text variant={emphasized ? totalVariant : 'bodyXSmall'} color={emphasized ? 'primary' : 'secondary'}>
          {r.label}
        </Text>
        {r.info ? <Icon name="info" size="xs" color={t.icon.secondary} /> : null}
      </View>
      <Text
        variant={emphasized ? totalVariant : 'bodyXSmall'}
        style={{ color: r.tone === 'success' ? t.icon.success : t.text.primary }}
      >
        {r.value}
      </Text>
    </View>
  );

  return (
    <View
      ref={ref}
      style={[
        {
          width: '100%',
          backgroundColor: embedded ? 'transparent' : t.background.surface,
          borderRadius: embedded ? 0 : t.radius.default,
          padding: embedded ? 0 : t.size['16'],
          gap: t.space.md,
        },
        style,
      ]}
      {...rest}
    >
      {title != null ? <Text variant="titleSmall">{title}</Text> : null}

      <View style={{ gap: t.space.sm }}>{rows.map((r, i) => renderRow(r, i))}</View>

      <View style={{ height: t.borderWidth.thin, backgroundColor: t.divider.color.default }} />

      <View style={{ gap: t.space.sm }}>
        {renderRow(total, 'total', true)}
        {paymentMethod ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodyXSmall" color="secondary">
              {paymentMethod.label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.size['8'] }}>
              {paymentMethod.logo ? <PaymentLogo name={paymentMethod.logo} /> : null}
              <Text variant="bodyXSmall" color="primary">
                {paymentMethod.value}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {footer ? (
        <Pressable
          accessibilityRole={footer.onPress ? 'button' : undefined}
          accessibilityLabel={footer.label}
          onPress={footer.onPress}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: t.background.tertiary,
              borderRadius: t.radius.default,
              paddingVertical: t.size['12'],
              paddingHorizontal: t.size['12'],
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.size['8'] }}>
            <Icon name="receipt" size="sm" color={t.icon.secondary} />
            <Text variant="bodyXSmall" color="primary">
              {footer.label}
            </Text>
          </View>
          <Icon name="chevron-right" size="sm" color={t.icon.secondary} />
        </Pressable>
      ) : null}
    </View>
  );
});
