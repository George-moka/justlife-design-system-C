import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInput as TextInputType,
  type TextInputFocusEventData,
  type TextInputProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typographyToStyle } from '../../theme/style-helpers';
import { Text } from '../../primitives/Text';

export interface InputProps extends Omit<TextInputProps, 'style' | 'editable'> {
  label?: string;
  helperText?: string;
  /** Error message; presence puts the field into the error state. */
  errorText?: string;
  disabled?: boolean;
}

export const Input = forwardRef<TextInputType, InputProps>(function Input(
  { label, helperText, errorText, disabled = false, onFocus, onBlur, ...rest },
  ref,
) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorText);

  const borderColor = hasError
    ? t.input.border.error
    : focused
      ? t.input.border.active
      : t.input.border.default;

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={{ width: '100%', gap: t.space.xs }}>
      {label ? (
        <Text variant="labelMedium" style={{ color: t.input.label.color }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        editable={!disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={t.input.placeholder.color}
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        // `aria-invalid` is forwarded to the DOM by react-native-web; spread as a
        // loose record so it type-checks against the React Native prop types too.
        {...({ 'aria-invalid': hasError } as Record<string, unknown>)}
        style={[
          // Use the body typography so the field renders in Poppins (web).
          typographyToStyle(t.typography.bodyMedium),
          {
            width: '100%',
            minHeight: t.touchTarget.min,
            paddingHorizontal: t.space.md,
            paddingVertical: t.space.sm,
            borderRadius: t.radius.control,
            borderWidth: t.borderWidth.default,
            borderColor,
            color: disabled ? t.text.disabled : t.text.primary,
            backgroundColor: disabled ? t.input.bg.disabled : t.input.bg.default,
          },
        ]}
        {...rest}
      />
      {hasError ? (
        <Text variant="bodyXSmall" style={{ color: t.text.error }}>
          {errorText}
        </Text>
      ) : helperText ? (
        <Text variant="bodyXSmall" style={{ color: t.input.helper.color }}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});
