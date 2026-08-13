import React, { forwardRef } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';

export interface TabsItem {
  /** Stable identifier, matched against `activeKey`. */
  key: string;
  label: string;
}

export interface TabsProps extends Omit<ViewProps, 'children'> {
  /** Tabs, left → right. */
  items: TabsItem[];
  /** `key` of the selected tab. */
  activeKey: string;
  onChange?: (key: string) => void;
  /**
   * Compact mode — tabs size to their content (not full-width) and there's no full-width baseline, so the
   * group can sit **inline in a header** (e.g. right-aligned next to a screen title). Default `false`.
   */
  inline?: boolean;
}

/**
 * **Tabs** — underline **section tabs** (e.g. Upcoming / Past). Equal-width text tabs sitting on a
 * full-width hairline baseline; the active tab is brand-coloured with a 2px brand underline that overlaps
 * the baseline. Constant geometry (colour-only change) so there's no layout shift on select. Distinct from
 * `TabGroup` (bordered card tabs) and `PillGroup` (segmented pills). Single-select, controlled, tokenised.
 */
export const Tabs = forwardRef<ViewType, TabsProps>(function Tabs(
  { items, activeKey, onChange, inline = false, style, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <View
      ref={ref}
      accessibilityRole="tablist"
      style={[
        inline
          ? { flexDirection: 'row', gap: t.space.md }
          : { flexDirection: 'row', borderBottomWidth: t.borderWidth.hairline, borderBottomColor: t.divider.color.default },
        style,
      ]}
      {...rest}
    >
      {items.map((item) => {
        const selected = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={item.label}
            onPress={() => onChange?.(item.key)}
            style={({ pressed }) => ({
              // Full-width tabs flex to fill; inline tabs size to content for a header placement.
              ...(inline ? null : { flex: 1 }),
              alignItems: 'center',
              paddingVertical: inline ? t.space.xs : t.space.sm,
              // 2px underline; transparent when inactive (full-width shows the baseline through it).
              borderBottomWidth: t.size['2'],
              borderBottomColor: selected ? t.border.brandDefault : 'transparent',
              marginBottom: inline ? 0 : -t.borderWidth.hairline,
              opacity: pressed && !selected ? 0.7 : 1,
            })}
          >
            <Text variant="labelMedium" style={{ color: selected ? t.text.brand : t.text.primary }}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});
