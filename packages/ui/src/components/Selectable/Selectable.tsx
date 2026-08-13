import React, { type ReactNode } from 'react';
import { Pressable, type AccessibilityRole, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { hapticTap } from '../../lib/haptics';

export interface SelectableProps {
  /** Selected state — brand fill + brand border when true. */
  selected?: boolean;
  onPress?: () => void;
  /** Dim + block interaction. */
  disabled?: boolean;
  /** The chip's content (text, a number, a two-line date, etc.). Selected text should use `text.onBrand`. */
  children?: ReactNode;
  accessibilityLabel?: string;
  /** Defaults to `button` (matches `SelectableCard`/`TabGroup`); pass `radio`/`checkbox` inside a group. */
  accessibilityRole?: AccessibilityRole;
  /** Sizing/spacing for the specific use (width/height/padding). */
  style?: StyleProp<ViewStyle>;
}

/**
 * **Selectable** — the low-level **selection chip**: a bordered, centred pressable that fills with brand
 * colour when `selected`. It is the single source of truth for every small choice affordance — numbers,
 * pills, dates, time slots, weekday toggles — so corner radius (`radius.control`) and the selected look stay
 * identical everywhere. Content-agnostic (pass any `children`); the higher-level pickers (`DatePicker`,
 * `TimeSlotPicker`, `WeekdayPicker`, `NumberSelector`, `PillGroup`) compose it.
 *
 * For a larger, full-width selectable **card** (icon + title + description) use `SelectableCard` instead.
 */
export function Selectable({
  selected = false,
  onPress,
  disabled = false,
  children,
  accessibilityLabel,
  accessibilityRole = 'button',
  style,
}: SelectableProps) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={() => {
        // Selecting a chip is a tactile choice — tick it (native only; no-op on web).
        hapticTap();
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          borderRadius: t.radius.control,
          borderWidth: t.borderWidth.thin,
          borderColor: selected ? t.border.brandDefault : t.border.default,
          backgroundColor: selected ? t.background.brandDefault : t.background.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? t.opacity['40'] : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
