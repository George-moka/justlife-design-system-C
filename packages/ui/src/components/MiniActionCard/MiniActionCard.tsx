import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../Card';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';

export interface MiniActionCardProps {
  /** Caption at the top (e.g. "Voucher Code", "No Available Credit"). */
  label: string;
  /** Trailing action link shown in the **default** state (e.g. "Add", "Details"). */
  action?: string;
  /** Press handler for the action link. */
  onPress?: () => void;
  /** When set, the card switches to the **applied** state: selected treatment, the value, and a ✕. */
  value?: string;
  /** ✕ handler in the applied state. */
  onRemove?: () => void;
  /** Accessible label for the ✕. Default "Remove". */
  removeLabel?: string;
}

/**
 * **MiniActionCard** — a slim, equal-height action tile (designed to sit in a row, e.g. a Voucher + Wallet
 * pair). Two states from one component: **default** (caption + a link like "Add"/"Details") and **applied**
 * (caption + an entered `value` + a ✕ to clear it, in the selected card treatment). `flex: 1`, so wrap
 * siblings in an `HStack` to split the row.
 */
export function MiniActionCard({ label, action, onPress, value, onRemove, removeLabel = 'Remove' }: MiniActionCardProps) {
  const t = useTheme();
  const applied = value != null && value !== '';
  return (
    <Card
      bordered={!applied}
      padded={false}
      elevation="none"
      style={{
        flex: 1,
        padding: t.space.md,
        minHeight: t.size['72'],
        justifyContent: 'space-between',
        ...(applied
          ? { borderWidth: t.borderWidth.default, borderColor: t.border.brandDefault, backgroundColor: t.background.selected }
          : null),
      }}
    >
      <Text variant="bodyXSmall" color="secondary" style={applied ? { paddingRight: t.size['24'] } : undefined}>
        {label}
      </Text>

      {applied ? (
        <>
          <Text variant="labelBase" color="primary" numberOfLines={1} style={{ paddingRight: t.size['24'] }}>
            {value}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={removeLabel}
            onPress={onRemove}
            hitSlop={t.space.sm}
            style={({ pressed }) => ({ position: 'absolute', top: t.space.md, right: t.space.md, opacity: pressed ? 0.6 : 1 })}
          >
            <Icon name="x" size="sm" color={t.icon.secondary} />
          </Pressable>
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          onPress={onPress}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text variant="labelXSmall" color="link">
            {action}
          </Text>
        </Pressable>
      )}
    </Card>
  );
}
