import React from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Selectable } from '../Selectable';

export interface TimeSlotPickerProps {
  /** Time-range labels, e.g. `"12:30 – 13:00"`. */
  slots: string[];
  /** Currently-selected slot. */
  value: string;
  onChange: (slot: string) => void;
}

/**
 * **TimeSlotPicker** — a horizontal row of single-select time-range chips. Composes `Selectable` so the
 * look matches the date and weekday pickers. Scrolls horizontally and owns its side inset (`space.md`).
 */
export function TimeSlotPicker({ slots, value, onChange }: TimeSlotPickerProps) {
  const t = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: t.size['8'], paddingHorizontal: t.space.md }}
    >
      {slots.map((s) => {
        const selected = s === value;
        return (
          <Selectable
            key={s}
            selected={selected}
            onPress={() => onChange(s)}
            style={{ paddingHorizontal: t.space.md, height: t.size['40'] }}
          >
            <Text variant="labelBase" style={{ color: selected ? t.text.onBrand : t.text.primary }}>
              {s}
            </Text>
          </Selectable>
        );
      })}
    </ScrollView>
  );
}
