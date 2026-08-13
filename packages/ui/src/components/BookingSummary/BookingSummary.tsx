import React, { forwardRef } from 'react';
import { Image, Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';
import type { PriceDetailsRow } from '../PriceDetails';

export interface BookingSummaryProfessional {
  name: string;
  rating?: string | number;
  photo?: string;
  /** Makes the name a tappable link. */
  onPress?: () => void;
}

export interface BookingSummaryDetail {
  label: string;
  /** Plain text value (wraps to multiple lines). */
  value?: string;
  /** Professional chip (avatar + linked name + rating) — takes precedence over `value`. */
  professional?: BookingSummaryProfessional;
  /** In the `grid` layout, span the full width (for long values like add-ons). */
  wide?: boolean;
  /**
   * In the `grid` layout, render as a slim right-hand "aside" (~⅓ width) instead of the wider main
   * column — for short values (e.g. "One time", "With Materials") so the long field beside it gets room.
   */
  narrow?: boolean;
}

export interface BookingSummaryProps extends Omit<ViewProps, 'children'> {
  /** Heading; defaults to "Booking Details". Pass `null` to hide it. */
  title?: string | null;
  /** Booking detail rows (date, professional, service, add-ons…). */
  details: BookingSummaryDetail[];
  /** Price breakdown — present = the "with payment" variant. Omit for details only. */
  price?: { rows: PriceDetailsRow[]; total: PriceDetailsRow };
  /**
   * Detail layout:
   * - `rows` (default) — label left / value right (the Figma form).
   * - `grid` — caption-over-value grid with an asymmetric **main (~62%) + aside (~35%)** pairing:
   *   default items take the wide main column, `narrow` items the slim right aside, `wide` items span
   *   the full row.
   */
  layout?: 'rows' | 'grid';
}

/**
 * Booking summary (Figma "Summary" → `summary=with payment`). A titled card listing booking
 * details (incl. a professional chip with avatar + linked name + rating) and, when `price` is
 * given, the cost breakdown + total. **Improved over the Figma:** sections are split by **visible
 * dividers** and the **total is emphasised** (`labelBase`, primary). The **`grid` layout** is an
 * alternative for detail-heavy summaries — a caption-over-value 2-column grid that avoids the uneven
 * 2× row heights you get when right-aligned values wrap in the `rows` layout. Tokenised; reuses
 * `PriceDetailsRow`.
 */
export const BookingSummary = forwardRef<ViewType, BookingSummaryProps>(function BookingSummary(
  { title = 'Booking Details', details, price, layout = 'rows', style, ...rest },
  ref,
) {
  const t = useTheme();

  const divider = <View style={{ height: t.borderWidth.thin, backgroundColor: t.divider.color.default }} />;

  const renderProfessional = (pro: BookingSummaryProfessional, align: 'flex-start' | 'flex-end' = 'flex-end') => {
    const name = (
      <Text variant="labelXSmall" color="link" numberOfLines={1}>
        {pro.name}
      </Text>
    );
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.size['4'], flexShrink: 1, justifyContent: align }}>
        <View
          style={{
            width: t.size['24'],
            height: t.size['24'],
            borderRadius: t.radius.pill,
            backgroundColor: t.avatar.bg.neutral,
            borderWidth: t.borderWidth.hairline,
            borderColor: t.border.default,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {pro.photo ? (
            <Image source={{ uri: pro.photo }} style={{ width: '100%', height: '100%' }} accessibilityIgnoresInvertColors />
          ) : (
            <Icon name="user" size="sm" color={t.icon.secondary} />
          )}
        </View>
        {pro.onPress ? (
          <Pressable onPress={pro.onPress} accessibilityRole="link" accessibilityLabel={pro.name}>
            {name}
          </Pressable>
        ) : (
          name
        )}
        {pro.rating != null ? (
          <>
            <Icon name="star" size="xs" color={t.background.rating} fill={t.background.rating} />
            <Text variant="bodyXSmall" color="primary">
              {String(pro.rating)}
            </Text>
          </>
        ) : null}
      </View>
    );
  };

  // `rows` layout: label left, value right (wraps → uneven 2× heights).
  const renderRowDetail = (d: BookingSummaryDetail, key: React.Key) => (
    <View key={key} style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: t.space.md }}>
      <Text variant="bodyXSmall" color="secondary">
        {d.label}
      </Text>
      {d.professional ? (
        renderProfessional(d.professional)
      ) : (
        <Text variant="bodyXSmall" color="primary" align="right" style={{ flex: 1 }}>
          {d.value}
        </Text>
      )}
    </View>
  );

  // `grid` cell: a small caption over its value; the value wraps cleanly under its own label.
  // `wide` spans the full row, `narrow` is the slim right aside, otherwise the wide main column.
  const renderStackedCell = (d: BookingSummaryDetail, key: React.Key) => (
    <View key={key} style={{ width: d.wide ? '100%' : d.narrow ? '35%' : '62%', gap: t.size['2'] }}>
      <Text variant="bodyMicro" color="secondary">
        {d.label}
      </Text>
      {d.professional ? (
        renderProfessional(d.professional, 'flex-start')
      ) : (
        <Text variant="bodyXSmall" color="primary">
          {d.value}
        </Text>
      )}
    </View>
  );

  const detailsBlock =
    layout === 'grid' ? (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: t.space.sm, rowGap: t.space.md }}>
        {details.map((d, i) => renderStackedCell(d, i))}
      </View>
    ) : (
      <View style={{ gap: t.space.sm }}>{details.map((d, i) => renderRowDetail(d, i))}</View>
    );

  const renderPriceRow = (r: PriceDetailsRow, key: React.Key, emphasized = false) => (
    <View key={key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.size['4'] }}>
        <Text variant={emphasized ? 'labelBase' : 'bodyXSmall'} color={emphasized ? 'primary' : 'secondary'}>
          {r.label}
        </Text>
        {r.info ? <Icon name="info" size="xs" color={t.icon.secondary} /> : null}
      </View>
      <Text
        variant={emphasized ? 'labelBase' : 'bodyXSmall'}
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
          backgroundColor: t.background.surface,
          borderRadius: t.radius.default,
          padding: t.size['16'],
          gap: t.space.md,
        },
        style,
      ]}
      {...rest}
    >
      {title != null ? <Text variant="titleSmall">{title}</Text> : null}

      {detailsBlock}

      {price ? (
        <>
          {divider}
          <View style={{ gap: t.space.sm }}>{price.rows.map((r, i) => renderPriceRow(r, i))}</View>
          {divider}
          {renderPriceRow(price.total, 'total', true)}
        </>
      ) : null}
    </View>
  );
});
