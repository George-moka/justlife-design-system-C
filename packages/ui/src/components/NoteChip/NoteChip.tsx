import React, { forwardRef } from 'react';
import { Pressable, type View as ViewType, type PressableProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useControllableState } from '../../hooks/useControllableState';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon/Icon';

export interface NoteChipProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  /** Chip label. */
  children: React.ReactNode;
  /** Optional leading Lucide icon name. */
  icon?: string;
  selected?: boolean;
  defaultSelected?: boolean;
  onChange?: (selected: boolean) => void;
  accessibilityLabel?: string;
}

/** Selectable chip (Figma Note Chip). Default / Selected states; colours tokenised. */
export const NoteChip = forwardRef<ViewType, NoteChipProps>(function NoteChip(
  { children, icon, selected, defaultSelected = false, onChange, accessibilityLabel, ...rest },
  ref,
) {
  const t = useTheme();
  const [isSelected, setSelected] = useControllableState(selected, defaultSelected);

  const bg = isSelected ? t.background.selected : t.background.secondary;
  const borderColor = isSelected ? t.border.brandDefault : t.border.default;
  const fg = isSelected ? t.text.brand : t.text.primary;
  const iconColor = isSelected ? t.text.brand : t.text.secondary;

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
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: t.space.xs,
        paddingHorizontal: t.space.sm,
        paddingVertical: t.space.sm,
        borderRadius: t.radius.sm,
        borderWidth: t.borderWidth.thin,
        borderColor,
        backgroundColor: bg,
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size="sm" color={iconColor} /> : null}
      <Text variant="bodyBase" style={{ color: fg }}>
        {children}
      </Text>
    </Pressable>
  );
});
