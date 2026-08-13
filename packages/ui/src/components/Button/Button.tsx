import React, { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type View as ViewType,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon/Icon';
import type { Tokens } from '@justlife/tokens';
import { hapticTap } from '../../lib/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'tertiary' | 'destructive' | 'pill';
export type ButtonSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg';
/** Overrides the foreground (label + icon) colour, keeping the variant's bg/border. */
export type ButtonTone = 'brand' | 'danger' | 'neutral';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style' | 'disabled'> {
  /** Button label. */
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Force a fully-rounded (pill) radius while keeping the variant's colours. Default `'default'`. */
  shape?: 'default' | 'pill';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Trim horizontal padding for dense contexts (e.g. in-card CTAs with an icon + label). */
  compact?: boolean;
  /** Recolour the label + icon by intent (e.g. a white `pill` with `brand`/`danger` text). */
  tone?: ButtonTone;
  /** Lucide icon name (kebab-case), e.g. "plus". See https://lucide.dev/icons */
  leftIcon?: string;
  rightIcon?: string;
  /** Required when `children` is not a plain string. */
  accessibilityLabel?: string;
}

interface VariantColors {
  bg: string;
  pressedBg: string;
  text: string;
  border?: string;
  disabledBg: string;
  disabledText: string;
  disabledBorder: string;
}

function getVariantColors(t: Tokens, variant: ButtonVariant): VariantColors {
  const disabled = {
    disabledBg: t.btn.disabled.bg,
    disabledText: t.btn.disabled.text,
    disabledBorder: t.btn.disabled.border,
  };
  switch (variant) {
    case 'secondary':
      return { bg: t.btn.secondary.bg, pressedBg: t.btn.secondary.bgActive, text: t.btn.secondary.text, ...disabled };
    case 'outline':
      return {
        bg: 'transparent',
        pressedBg: t.btn.outline.bgActive,
        text: t.btn.outline.text,
        border: t.btn.outline.border,
        ...disabled,
      };
    case 'tertiary':
      return { bg: t.btn.tertiary.bg, pressedBg: t.btn.tertiary.bgActive, text: t.btn.tertiary.text, ...disabled };
    case 'destructive':
      return { bg: t.btn.destructive.bg, pressedBg: t.btn.destructive.bgActive, text: t.btn.destructive.text, ...disabled };
    case 'pill':
      return {
        bg: t.btn.pill.bg,
        pressedBg: t.btn.pill.bgActive,
        text: t.btn.pill.text,
        border: t.btn.pill.border,
        ...disabled,
      };
    case 'primary':
    default:
      return { bg: t.btn.primary.bg, pressedBg: t.btn.primary.bgActive, text: t.btn.primary.text, ...disabled };
  }
}

function getSizing(t: Tokens, size: ButtonSize) {
  switch (size) {
    // Tiniest control (~22px) — for the "Add" button that toggles with the `sm`
    // QuantityStepper (heights must match so the row doesn't reflow).
    case '2xs':
      return { paddingHorizontal: t.size['12'], paddingVertical: t.space.xs };
    // Standard card CTA (~32px) — compact label/width but more vertical breathing
    // room than `2xs`. The default for in-card action buttons.
    case 'xs':
      return { paddingHorizontal: t.size['12'], paddingVertical: t.space.sm };
    case 'sm':
      return { paddingHorizontal: t.space.md, paddingVertical: t.space.xs, minHeight: t.size['40'] };
    case 'lg':
      return { paddingHorizontal: t.space.xl, paddingVertical: t.space.md, minHeight: t.touchTarget.comfortable };
    case 'md':
    default:
      return { paddingHorizontal: t.space.lg, paddingVertical: t.space.sm, minHeight: t.touchTarget.min };
  }
}

/** Label type scale per button size. The compact `2xs`/`xs` use the small label. */
const LABEL_VARIANT = {
  '2xs': 'labelXSmall',
  xs: 'labelXSmall',
  sm: 'labelMedium',
  md: 'labelMedium',
  lg: 'labelMedium',
} as const;

export const Button = forwardRef<ViewType, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    shape = 'default',
    loading = false,
    disabled = false,
    fullWidth = false,
    compact = false,
    tone,
    leftIcon,
    rightIcon,
    accessibilityLabel,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const colors = getVariantColors(t, variant);
  const sizing = getSizing(t, size);
  const isDisabled = disabled || loading;
  const hasBorder = colors.border !== undefined;
  const toneColors: Record<ButtonTone, string> = {
    brand: t.text.brand,
    danger: t.text.error,
    neutral: t.text.primary,
  };
  const labelColor = isDisabled ? colors.disabledText : tone ? toneColors[tone] : colors.text;
  const label = typeof children === 'string' ? children : accessibilityLabel;

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      // Tactile tick on every button press (native only; no-op on web) — AGENTS #48.
      onPressIn={(e) => {
        hapticTap();
        rest.onPressIn?.(e);
      }}
      style={({ pressed }) => [
        styles.base,
        {
          ...sizing,
          // Trim horizontal padding in dense contexts (in-card CTAs); other sizing stays.
          ...(compact ? { paddingHorizontal: t.space.sm } : null),
          borderRadius:
            shape === 'pill' || variant === 'pill'
              ? t.radius.pill
              : size === 'xs' || size === '2xs'
                ? t.radius.md
                : t.radius.control,
          gap: size === 'xs' || size === '2xs' ? t.space.xs : t.space.sm,
          backgroundColor: isDisabled ? colors.disabledBg : pressed ? colors.pressedBg : colors.bg,
        },
        hasBorder && {
          borderWidth: t.borderWidth.default,
          borderColor: isDisabled ? colors.disabledBorder : colors.border,
        },
        fullWidth && styles.fullWidth,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} accessibilityLabel="Loading" />
      ) : (
        <>
          {leftIcon ? <Icon name={leftIcon} size="sm" color={labelColor} /> : null}
          <Text variant={LABEL_VARIANT[size]} style={{ color: labelColor }}>
            {children}
          </Text>
          {rightIcon ? <Icon name={rightIcon} size="sm" color={labelColor} /> : null}
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
});
