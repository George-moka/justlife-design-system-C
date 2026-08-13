import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { Icon } from '../Icon';
import { Badge } from '../Badge';
import { Radio } from '../Radio';
import { SelectableCard } from '../SelectableCard';

export interface AddressCardProps extends Omit<ViewProps, 'children'> {
  /** Address label / type, e.g. "Home", "Work". */
  label: string;
  /** Full address line (truncated to one line). */
  address: string;
  /** Optional smaller third line — extra info / instructions. Brand-coloured when selected. */
  note?: string;
  /** Icon shown before the label. Defaults to a map-pin; pass `null` to hide. */
  typeIcon?: ReactNode;
  /** Show a "Default" badge next to the label. */
  defaultBadge?: boolean;
  /** Optional error line (e.g. out-of-service area), shown in the error colour. */
  errorMessage?: string;
  /** Selectable mode: shows a radio + selected styling. */
  selected?: boolean;
  /** Muted, non-interactive state. */
  disabled?: boolean;
  /** Trailing edit action (pencil). */
  onEdit?: () => void;
  /** Trailing delete action (trash). */
  onDelete?: () => void;
  /**
   * Trailing text label (e.g. "Change" on the checkout's current address — tap the row to switch).
   * Mirrors `PaymentMethodCard`'s API so the two "current selection" cards read identically.
   */
  trailing?: string;
  /** `muted` (secondary status) or `action` (link-coloured CTA). Default `muted`. */
  trailingTone?: 'muted' | 'action';
  onPress?: () => void;
}

/**
 * Saved-address card (Figma "Address Selection → Selectable Item"). A label with
 * a leading type icon + optional "Default" badge, the address line, an optional
 * note, and trailing radio / edit / delete actions. Selectable mode adds a radio
 * and selected styling. Every value is tokenised.
 */
export const AddressCard = forwardRef<ViewType, AddressCardProps>(function AddressCard(
  {
    label,
    address,
    note,
    typeIcon,
    defaultBadge = false,
    errorMessage,
    selected,
    disabled = false,
    onEdit,
    onDelete,
    trailing,
    trailingTone = 'muted',
    onPress,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const selectable = selected !== undefined;
  const leadingIcon =
    typeIcon === undefined ? <Icon name="map-pin" size="sm" color={t.text.secondary} /> : typeIcon;
  const hasTrailing = selectable || !!onEdit || !!onDelete || !!trailing;

  return (
    <SelectableCard
      ref={ref}
      selected={selected}
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={label}
      style={style}
      {...rest}
    >
      <VStack style={{ flex: 1, gap: t.space.xs }}>
        <VStack style={{ gap: t.size['2'] }}>
          {/* Fixed row height so the (slightly taller) "Default" badge can't nudge the
              text below when it appears/disappears. */}
          <HStack align="center" gap="xs" style={{ height: t.size['16'] }}>
            {leadingIcon}
            <Text
              variant="labelXSmall"
              color={disabled ? 'disabled' : 'primary'}
              numberOfLines={1}
              style={{ flexShrink: 1 }}
            >
              {label}
            </Text>
            {defaultBadge ? <Badge tone="success">Default</Badge> : null}
          </HStack>
          <Text variant="bodyXSmall" color={disabled ? 'disabled' : 'secondary'} numberOfLines={1}>
            {address}
          </Text>
        </VStack>
        {note ? (
          <Text variant="bodyMicro" color={selected ? 'brand' : 'disabled'} numberOfLines={1}>
            {note}
          </Text>
        ) : null}
        {errorMessage ? (
          <Text variant="bodyXSmall" color="error" numberOfLines={2}>
            {errorMessage}
          </Text>
        ) : null}
      </VStack>

      {hasTrailing ? (
        <HStack align="center" gap="sm">
          {selectable ? (
            <View pointerEvents="none">
              {/* 24px plate — the Figma "Selectable Item" radio. The 16px one reads as a bullet next to a
                  three-line address block. */}
              <Radio size="md" selected={selected} disabled={disabled} accessibilityLabel={label} />
            </View>
          ) : null}
          {onEdit ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${label}`}
              onPress={onEdit}
              hitSlop={t.space.sm}
            >
              <Icon name="pencil" size="md" color={t.icon.brand} />
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete ${label}`}
              onPress={onDelete}
              hitSlop={t.space.sm}
            >
              <Icon name="trash-2" size="md" color={t.text.error} />
            </Pressable>
          ) : null}
          {!selectable && trailing ? (
            <Text variant="labelXSmall" color={trailingTone === 'action' ? 'link' : 'secondary'}>
              {trailing}
            </Text>
          ) : null}
        </HStack>
      ) : null}
    </SelectableCard>
  );
});
