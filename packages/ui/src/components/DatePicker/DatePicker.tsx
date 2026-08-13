import React from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Selectable } from '../Selectable';

export interface DatePickerDay {
  /** Short weekday label, e.g. "FRI". */
  day: string;
  /** Date-of-month value — also the selection key. */
  date: number | string;
  disabled?: boolean;
}

export interface DatePickerProps {
  /** The days to show (a horizontal strip). */
  days: DatePickerDay[];
  /** Currently-selected `date`. */
  value: number | string;
  onChange: (date: number | string) => void;
}

/**
 * **DatePicker** — a horizontal strip of day chips (weekday label over the date number), single-select.
 * Composes `Selectable`, so the chip look matches every other choice control. Scrolls horizontally and
 * manages its own side inset (`space.md`). For picking days-of-week (recurring) use `WeekdayPicker`; for
 * time use `TimeSlotPicker`.
 */
export function DatePicker({ days, value, onChange }: DatePickerProps) {
  const t = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: t.size['8'], paddingHorizontal: t.space.md }}
    >
      {days.map((d) => {
        const selected = d.date === value;
        return (
          <Selectable
            key={d.date}
            selected={selected}
            disabled={d.disabled}
            onPress={() => onChange(d.date)}
            accessibilityLabel={`${d.day} ${d.date}`}
            style={{ width: t.size['56'], paddingVertical: t.space.sm, gap: t.size['2'] }}
          >
            {/* Weekday is a small muted caption above the date number (the date is the chip's main label). */}
            <Text variant="bodyMicro" style={{ color: selected ? t.text.onBrand : t.text.secondary }}>
              {d.day}
            </Text>
            <Text variant="labelBase" style={{ color: selected ? t.text.onBrand : t.text.primary }}>
              {d.date}
            </Text>
          </Selectable>
        );
      })}
    </ScrollView>
  );
}
