import React, { forwardRef } from 'react';
import { Pressable, View, type View as ViewType, type PressableProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useControllableState } from '../../hooks/useControllableState';
import type { ControlSize } from '../Toggle/Toggle';
import { hapticTap } from '../../lib/haptics';

export interface RadioProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  selected?: boolean;
  defaultSelected?: boolean;
  onChange?: (selected: boolean) => void;
  size?: ControlSize;
  disabled?: boolean;
  accessibilityLabel?: string;
  /**
   * `false` renders a **decorative** radio — a non-interactive, a11y-hidden visual indicator. Use when an
   * enclosing control (e.g. a selectable card) owns the press + selection semantics, so the radio isn't a
   * second focusable `radio` nested inside a button. Default `true`.
   */
  interactive?: boolean;
}

// Intrinsic plate + dot sizes from the Figma "Controls" set.
const SIZES = {
  sm: { box: 16, dot: 7 },
  md: { box: 24, dot: 12 },
} as const;

/** Radio button. Mirrors the Figma Controls → Radio; colours are tokenised. */
export const Radio = forwardRef<ViewType, RadioProps>(function Radio(
  { selected, defaultSelected = false, onChange, size = 'sm', disabled = false, accessibilityLabel, interactive = true, ...rest },
  ref,
) {
  const t = useTheme();
  const [isSelected, setSelected] = useControllableState(selected, defaultSelected);
  const s = SIZES[size];

  const borderColor = disabled
    ? t.border.disabled
    : isSelected
      ? t.border.brandDefault
      : t.border.default;
  const dotColor = disabled ? t.icon.disabled : t.background.brandDefault;

  const dot = isSelected ? (
    <View style={{ width: s.dot, height: s.dot, borderRadius: t.radius.pill, backgroundColor: dotColor }} />
  ) : null;
  const box = {
    width: s.box,
    height: s.box,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: t.radius.pill,
    borderWidth: t.borderWidth.thin,
    borderColor,
  };

  // Decorative: a plain visual ring (no role / focus / press), hidden from the a11y tree — the enclosing
  // control conveys selection. Avoids a focusable `radio` nested inside another interactive element.
  if (!interactive) {
    return (
      <View
        ref={ref}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={box}
      >
        {dot}
      </View>
    );
  }

  const handlePress = () => {
    // Tactile tick on state change (native only; no-op on web) — AGENTS #48.
    hapticTap();
    if (disabled) return;
    setSelected(true);
    onChange?.(true);
  };

  return (
    <Pressable
      ref={ref}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled }}
      {...({ 'aria-checked': isSelected } as Record<string, unknown>)}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={handlePress}
      style={box}
      {...rest}
    >
      {dot}
    </Pressable>
  );
});
