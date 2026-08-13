import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { HStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Selectable } from '../Selectable';

export interface WeekdayPickerDay {
  /** Stable key reported to `onToggle` (e.g. "mon"). */
  key: string;
  /** Short visible label (e.g. "M"). */
  label: string;
}

export interface WeekdayPickerProps {
  /** The seven days. Defaults to Mon→Sun single-letter labels. */
  days?: WeekdayPickerDay[];
  /** Selected day keys. */
  value: string[];
  /** Toggle a day on/off. */
  onToggle: (key: string) => void;
}

/** Mon→Sun, single-letter labels. */
export const DEFAULT_WEEKDAYS: WeekdayPickerDay[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

/**
 * **WeekdayPicker** — a row of seven **multi-select** day chips (single-letter labels) for choosing which
 * weekdays a recurring booking repeats on. Composes `Selectable`; the chips flex to fill the width with a
 * **token gap** (`space.sm`, matching the other pickers). For a single service date use `DatePicker`; for a
 * time use `TimeSlotPicker`.
 */
export function WeekdayPicker({ days = DEFAULT_WEEKDAYS, value, onToggle }: WeekdayPickerProps) {
  const t = useTheme();
  return (
    <HStack gap="sm">
      {days.map((d, i) => {
        const selected = value.includes(d.key);
        return (
          <Selectable
            key={`${d.key}-${i}`}
            selected={selected}
            onPress={() => onToggle(d.key)}
            accessibilityLabel={d.key}
            style={{ flex: 1, height: t.size['40'] }}
          >
            <Text variant="labelBase" style={{ color: selected ? t.text.onBrand : t.text.primary }}>
              {d.label}
            </Text>
          </Selectable>
        );
      })}
    </HStack>
  );
}
