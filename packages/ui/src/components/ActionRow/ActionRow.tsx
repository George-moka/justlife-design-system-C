import React, { forwardRef } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';

export interface ActionRowProps extends Omit<ViewProps, 'children'> {
  /** Leading Lucide icon name (kebab-case), e.g. "banknote". */
  icon: string;
  /** Row label. */
  label: string;
  /** Optional trailing count badge (e.g. an unread/pending count). */
  badge?: string | number;
  /** Show the trailing chevron. Default `true`. */
  showChevron?: boolean;
  onPress?: () => void;
}

/**
 * **Action row** (Figma "icon+text button"). A slim, full-width tappable row on a card surface: a
 * recessed grey fill (`background.tertiary`), a leading icon, a label, an optional trailing count
 * badge and a chevron. The canonical treatment for stacked secondary actions (pay pending amount,
 * edit booking, show receipt…). Everything tokenised; `radius.default` corners match the other grey
 * rows on a screen.
 */
export const ActionRow = forwardRef<ViewType, ActionRowProps>(function ActionRow(
  { icon, label, badge, showChevron = true, onPress, style, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space.sm,
          minHeight: t.size['48'],
          paddingHorizontal: t.space.md,
          borderRadius: t.radius.default,
          backgroundColor: t.background.tertiary,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <Icon name={icon} size="md" color={t.icon.secondary} />
      <Text variant="labelBase" color="primary" style={{ flex: 1 }}>
        {label}
      </Text>
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
          <Text variant="labelXXSmall" style={{ color: t.text.onBrand }}>
            {String(badge)}
          </Text>
        </View>
      ) : null}
      {showChevron ? <Icon name="chevron-right" size="sm" color={t.icon.secondary} /> : null}
    </Pressable>
  );
});
