import React, { forwardRef, type ReactNode } from 'react';
import { Pressable, View, type View as ViewType, type PressableProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useControllableState } from '../../hooks/useControllableState';
import { Text } from '../../primitives/Text';

export interface CategoryCardProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  /** Category label. */
  label: string;
  /** Image/illustration for the 56×56 slot (e.g. an `<Image>` or `<Icon>`). */
  image?: ReactNode;
  selected?: boolean;
  defaultSelected?: boolean;
  onChange?: (selected: boolean) => void;
  accessibilityLabel?: string;
}

/** Selectable category tile (Figma Category Card). Default / Selected; colours tokenised. */
export const CategoryCard = forwardRef<ViewType, CategoryCardProps>(function CategoryCard(
  { label, image, selected, defaultSelected = false, onChange, accessibilityLabel, ...rest },
  ref,
) {
  const t = useTheme();
  const [isSelected, setSelected] = useControllableState(selected, defaultSelected);

  const handlePress = () => {
    const next = !isSelected;
    setSelected(next);
    onChange?.(next);
  };

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      {...({ 'aria-pressed': isSelected } as Record<string, unknown>)}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={handlePress}
      style={{
        width: 104,
        alignItems: 'center',
        gap: t.space.sm,
        paddingVertical: t.space.sm,
        paddingHorizontal: t.space.sm,
        borderRadius: t.radius.default,
        borderWidth: t.borderWidth.thin,
        borderColor: isSelected ? t.border.brandDefault : t.border.default,
        backgroundColor: isSelected ? t.background.selected : t.background.surface,
      }}
      {...rest}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: t.radius.md,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.background.tertiary,
        }}
      >
        {image}
      </View>
      <Text
        variant="bodyXSmall"
        align="center"
        numberOfLines={2}
        style={{ color: isSelected ? t.text.brand : t.text.primary }}
      >
        {label}
      </Text>
    </Pressable>
  );
});
