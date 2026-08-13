import React, { forwardRef, useState } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInput as TextInputType,
  type TextInputFocusEventData,
  type TextInputProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typographyToStyle } from '../../theme/style-helpers';
import { Icon } from '../Icon';

export interface SearchBarProps extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> {
  /** Current query (controlled). */
  value: string;
  onChangeText: (text: string) => void;
  /** Placeholder shown when empty. Defaults to "Search". */
  placeholder?: string;
  /** Called when the clear (×) button is pressed. Defaults to clearing the value. */
  onClear?: () => void;
}

/**
 * Search bar (Figma "Search bar" → `Input/SearchMobile`). A pill text field with a leading
 * search icon and a circular clear button that appears once there's a value. Focus swaps the
 * surface + border from the `search.*` default tokens to their active variants. Fully tokenised.
 */
export const SearchBar = forwardRef<TextInputType, SearchBarProps>(function SearchBar(
  { value, onChangeText, placeholder = 'Search', onClear, onFocus, onBlur, accessibilityLabel, ...rest },
  ref,
) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(false);
    onBlur?.(e);
  };
  const handleClear = () => (onClear ? onClear() : onChangeText(''));

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.sm,
        width: '100%',
        height: t.size['40'],
        paddingHorizontal: t.space.md,
        borderRadius: t.radius.pill,
        borderWidth: t.borderWidth.thin,
        borderColor: focused ? t.search.border.active : t.search.border.default,
        backgroundColor: focused ? t.search.bg.active : t.search.bg.default,
      }}
    >
      <Icon name="search" size="sm" color={t.icon.secondary} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.input.placeholder.color}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        accessibilityLabel={accessibilityLabel ?? placeholder}
        style={[
          // Body typography so the field renders in Poppins (web).
          typographyToStyle(t.typography.bodyXSmall),
          { flex: 1, padding: 0, color: t.text.primary },
        ]}
        {...rest}
      />
      {hasValue ? (
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={t.space.sm}
          style={{
            width: t.size['16'],
            height: t.size['16'],
            borderRadius: t.radius.pill,
            backgroundColor: t.icon.secondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="x" size="xs" color={t.background.primary} />
        </Pressable>
      ) : null}
    </View>
  );
});
