import React, { forwardRef } from 'react';
import {
  Pressable,
  ScrollView,
  View,
  type View as ViewType,
  type ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';

/** Figma slider tab width — sized so ~2.5 tabs peek, signalling horizontal scroll. */
const DEFAULT_TAB_MIN_WIDTH = 139;

export interface TabGroupItem {
  /** Stable identifier, matched against `activeKey`. */
  key: string;
  /** Tab title (always shown). */
  label: string;
  /** Optional sub-line under the title (e.g. "You booked 18 times"). */
  subtitle?: string;
}

export interface TabGroupProps extends Omit<ViewProps, 'children'> {
  /** Tabs, left → right. */
  items: TabGroupItem[];
  /** `key` of the selected tab. */
  activeKey: string;
  onChange?: (key: string) => void;
  /**
   * `true` (Figma default for content-rich tabs) → a horizontal **slider**: each tab takes
   * `tabMinWidth` and the row scrolls, peeking the next tab. `false` → equal-width tabs that
   * `flex` to fill the container (for 2–3 short tabs). Defaults to `false`.
   */
  scrollable?: boolean;
  /** Min width of each tab in the scrollable layout. Defaults to the Figma 139px. */
  tabMinWidth?: number;
  /**
   * Side padding INSIDE the scroller (`scrollable` only). Give it the page gutter instead of wrapping
   * the group in a padded view: the row then spans the full width and tabs scroll past the edge, rather
   * than being clipped at a padding line with a dead strip beside them.
   */
  gutter?: number;
}

/**
 * Tab Group (Figma "Tab Group" / "Tab Item"). A row of card tabs, each a bordered card with a
 * title and an optional sub-line. The selected tab takes the brand border; the rest stay on the
 * default hairline-grey border. Two layouts: a horizontal **slider** (`scrollable`, min-width
 * tabs — the Figma content-rich variant) or equal-width **fill** tabs. Border width is constant
 * (colour-only change) to avoid a 1px layout shift. Single-select, controlled. Tokenised.
 */
export const TabGroup = forwardRef<ViewType, TabGroupProps>(function TabGroup(
  { items, activeKey, onChange, scrollable = false, tabMinWidth = DEFAULT_TAB_MIN_WIDTH, gutter, style, ...rest },
  ref,
) {
  const t = useTheme();

  const tabs = items.map((item) => {
    const selected = item.key === activeKey;
    return (
      <Pressable
        key={item.key}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={item.subtitle ? `${item.label}, ${item.subtitle}` : item.label}
        onPress={() => onChange?.(item.key)}
        style={({ pressed }) => [
          {
            alignItems: 'center',
            justifyContent: 'center',
            gap: t.size['2'],
            paddingVertical: t.size['10'],
            paddingHorizontal: t.space.sm,
            borderRadius: t.radius.default,
            borderWidth: t.borderWidth.thin,
            borderColor: selected ? t.border.brandDefault : t.border.default,
            // Selected = brand outline + very light blue fill (matches CategoryCard).
            backgroundColor: selected ? t.background.selected : t.background.primary,
            opacity: pressed && !selected ? 0.7 : 1,
          },
          scrollable ? { minWidth: tabMinWidth } : { flex: 1 },
        ]}
      >
        <Text variant="labelXSmall" color="primary" numberOfLines={1} align="center">
          {item.label}
        </Text>
        {item.subtitle ? (
          <Text variant="bodyMicro" color="secondary" numberOfLines={1} align="center">
            {item.subtitle}
          </Text>
        ) : null}
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        ref={ref as React.Ref<ScrollView>}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: t.space.sm, paddingHorizontal: gutter ?? t.space.none }}
        style={[{ width: '100%' }, style]}
        {...rest}
      >
        {tabs}
      </ScrollView>
    );
  }

  return (
    <View ref={ref} style={[{ flexDirection: 'row', gap: t.space.sm, width: '100%' }, style]} {...rest}>
      {tabs}
    </View>
  );
});
