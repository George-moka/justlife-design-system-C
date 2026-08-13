import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { HStack } from '../../primitives/Stack';
import { Icon } from '../Icon';

export interface ListRowProps extends Omit<ViewProps, 'children'> {
  /** Leading Lucide icon name (kebab-case), e.g. "user". */
  icon?: string;
  /** Row label. */
  label: string;
  /** Trailing value text — a current setting (e.g. "English", "Visa ··4242"). */
  value?: string;
  /** Trailing count badge (e.g. an unread/pending count). */
  badge?: string | number;
  /** Replace the entire trailing area (e.g. a `Toggle`). Overrides `value`/`badge`/chevron. */
  trailing?: ReactNode;
  /** Show the trailing chevron. Default `true`. Ignored when `trailing` is set. */
  showChevron?: boolean;
  /** Draw a bottom hairline divider, inset under the label. Set it on every row but the last. */
  divider?: boolean;
  /** Destructive styling — red icon + label (e.g. "Log out"). */
  destructive?: boolean;
  onPress?: () => void;
}

/**
 * **List row** (Figma "List item") — a clean, full-width settings/menu row for a white card surface:
 * a leading icon, a label, an optional trailing value / count badge / custom control, and a chevron.
 * Stacked inside a `Card` (with `divider` on all but the last) it forms a grouped menu — the canonical
 * treatment for account / settings / support lists. Distinct from `ActionRow` (the heavier grey
 * filled block for stacked one-off actions). Everything tokenised.
 */
export const ListRow = forwardRef<ViewType, ListRowProps>(function ListRow(
  {
    icon,
    label,
    value,
    badge,
    trailing,
    showChevron = true,
    divider = false,
    destructive = false,
    onPress,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const labelColor = destructive ? t.text.error : t.text.primary;
  const iconColor = destructive ? t.icon.error : t.icon.secondary;
  // Divider aligns under the label (clears the icon column + the row gap), iOS-style.
  const dividerInset = (icon != null ? t.iconSize.md + t.space.md : 0) + t.space.md;

  const inner = (
    <>
      <HStack
        gap="md"
        align="center"
        style={{ minHeight: t.size['48'], paddingHorizontal: t.space.md, paddingVertical: t.space.sm }}
      >
        {icon != null ? <Icon name={icon} size="md" color={iconColor} /> : null}
        <Text variant="labelBase" style={{ flex: 1, color: labelColor }}>
          {label}
        </Text>
        {trailing != null ? (
          trailing
        ) : (
          <HStack gap="sm" align="center">
            {value != null ? (
              <Text variant="bodyXSmall" color="secondary">
                {value}
              </Text>
            ) : null}
            {badge != null ? (
              <View
                style={{
                  minWidth: t.size['20'],
                  height: t.size['20'],
                  borderRadius: t.radius.pill,
                  backgroundColor: t.background.errorSolid,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: t.size['4'],
                }}
              >
                <Text variant="labelXXSmall" style={{ color: t.text.onError }}>
                  {String(badge)}
                </Text>
              </View>
            ) : null}
            {showChevron ? <Icon name="chevron-right" size="sm" color={t.icon.secondary} /> : null}
          </HStack>
        )}
      </HStack>
      {divider ? (
        <View
          style={{ height: t.borderWidth.hairline, backgroundColor: t.border.default, marginLeft: dividerInset }}
        />
      ) : null}
    </>
  );

  const a11yLabel = badge != null ? `${label}, ${badge}` : label;

  if (onPress) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        onPress={onPress}
        style={({ pressed }) => [{ backgroundColor: pressed ? t.background.secondary : 'transparent' }, style]}
        {...rest}
      >
        {inner}
      </Pressable>
    );
  }
  return (
    <View ref={ref} style={style} {...rest}>
      {inner}
    </View>
  );
});
