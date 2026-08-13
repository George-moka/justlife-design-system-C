import React, { forwardRef } from 'react';
import { Pressable, View, type View as ViewType, type PressableProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useControllableState } from '../../hooks/useControllableState';
import { hapticTap } from '../../lib/haptics';

export type ControlSize = 'sm' | 'md';

export interface ToggleProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  value?: boolean;
  defaultValue?: boolean;
  onValueChange?: (value: boolean) => void;
  size?: ControlSize;
  disabled?: boolean;
  accessibilityLabel?: string;
}

// Intrinsic dimensions from the Figma "Controls" set (track / thumb sizes).
const SIZES = {
  sm: { trackW: 28, trackH: 16, thumb: 12 },
  md: { trackW: 42, trackH: 24, thumb: 20 },
} as const;

/** On/off switch. Mirrors the Figma Controls → Toggle; colours are tokenised. */
export const Toggle = forwardRef<ViewType, ToggleProps>(function Toggle(
  { value, defaultValue = false, onValueChange, size = 'md', disabled = false, accessibilityLabel, ...rest },
  ref,
) {
  const t = useTheme();
  const [on, setOn] = useControllableState(value, defaultValue);
  const s = SIZES[size];
  const pad = t.size['2'];

  const trackColor = on && !disabled ? t.background.brandDefault : t.background.disabled;
  const thumbColor = disabled
    ? on
      ? t.icon.disabled
      : t.text.disabled
    : on
      ? t.icon.onSolid
      : t.background.tertiary;

  const handlePress = () => {
    // Tactile tick on state change (native only; no-op on web) — AGENTS #48.
    hapticTap();
    if (disabled) return;
    const next = !on;
    setOn(next);
    onValueChange?.(next);
  };

  return (
    <Pressable
      ref={ref}
      accessibilityRole="switch"
      accessibilityState={{ checked: on, disabled }}
      // react-native-web emits aria-checked from this on the DOM; native uses accessibilityState.
      {...({ 'aria-checked': on } as Record<string, unknown>)}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={handlePress}
      style={{
        width: s.trackW,
        height: s.trackH,
        borderRadius: t.radius.pill,
        backgroundColor: trackColor,
        padding: pad,
      }}
      {...rest}
    >
      <View
        style={{
          width: s.thumb,
          height: s.thumb,
          borderRadius: t.radius.pill,
          backgroundColor: thumbColor,
          marginLeft: on ? s.trackW - s.thumb - pad * 2 : 0,
        }}
      />
    </Pressable>
  );
});
