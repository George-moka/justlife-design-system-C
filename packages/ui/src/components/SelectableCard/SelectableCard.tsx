import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

/** Border strategy: always on · only in selectable mode · never. */
export type SelectableCardBorder = 'always' | 'whenSelectable' | 'none';

export interface SelectableCardProps extends Omit<ViewProps, 'children'> {
  children: ReactNode;
  /** Selected state — drives the selected background + brand border. `undefined` = not a selectable row. */
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Background when not selected. Default `background.primary`. */
  background?: string;
  /** Inner padding. Default `space.md`. */
  padding?: number;
  /** Fixed minimum row height (e.g. to equalise rows in a list). */
  minHeight?: number;
  /** Horizontal gap between children. Default `space.sm`. */
  gap?: number;
  /** Border strategy. Default `always`. */
  border?: SelectableCardBorder;
}

/**
 * Shared shell for selectable list rows (Figma "Selectable Item"). Owns the
 * container box, the selected background + brand border, press behaviour and the
 * horizontal row layout. Domain cards (AddressCard, PaymentMethodCard, …) compose
 * it and supply their own content + trailing controls. Every value is tokenised.
 */
export const SelectableCard = forwardRef<ViewType, SelectableCardProps>(function SelectableCard(
  {
    children,
    selected,
    disabled = false,
    onPress,
    accessibilityLabel,
    background,
    padding,
    minHeight,
    gap,
    border = 'always',
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const selectable = selected !== undefined;
  const borderWidth =
    border === 'none'
      ? t.borderWidth.none
      : border === 'whenSelectable'
        ? selectable
          ? t.borderWidth.thin
          : t.borderWidth.none
        : t.borderWidth.thin;

  const box = {
    width: '100%' as const,
    minHeight,
    backgroundColor: selected ? t.background.selected : (background ?? t.background.primary),
    borderRadius: t.radius.default,
    borderWidth,
    borderColor: selected ? t.border.brandDefault : t.border.default,
    padding: padding ?? t.space.md,
  };
  const row = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: gap ?? t.space.sm };

  if (onPress && !disabled) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [box, row, { opacity: pressed ? 0.95 : 1 }, style]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View ref={ref} style={[box, row, style]} {...rest}>
      {children}
    </View>
  );
});
