import React from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Selectable } from '../Selectable';

export interface NumberSelectorProps {
  /** Highest number shown (chips run `min`…`count`). */
  count: number;
  /** Lowest number shown. Default `1`. */
  min?: number;
  /** Selected number. */
  value: number;
  onChange: (n: number) => void;
}

/**
 * **NumberSelector** — a horizontal row of single-select number chips (`min`…`count`), for picking a count
 * such as hours or professionals. Composes `Selectable`. This is the *segmented* number picker; for a
 * −/+ stepper use `QuantityStepper` instead.
 */
export function NumberSelector({ count, min = 1, value, onChange }: NumberSelectorProps) {
  const t = useTheme();
  const numbers = Array.from({ length: Math.max(0, count - min + 1) }, (_, i) => min + i);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: t.size['8'], paddingHorizontal: t.space.md }}
    >
      {numbers.map((n) => {
        const selected = n === value;
        return (
          <Selectable
            key={n}
            selected={selected}
            onPress={() => onChange(n)}
            accessibilityLabel={`${n}`}
            style={{ width: t.size['40'], height: t.size['40'] }}
          >
            <Text variant="labelBase" style={{ color: selected ? t.text.onBrand : t.text.primary }}>
              {n}
            </Text>
          </Selectable>
        );
      })}
    </ScrollView>
  );
}
