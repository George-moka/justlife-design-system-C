import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { HStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Selectable } from '../Selectable';

export interface PillGroupOption {
  key: string;
  label: string;
}

export interface PillGroupProps {
  options: PillGroupOption[];
  /** Selected option key. */
  value: string;
  onChange: (key: string) => void;
}

/**
 * **PillGroup** — a single-select row of label pills (e.g. Weekly / Every Two Weeks, Yes / No). Composes
 * `Selectable` so the pills match every other choice control. For navigation tabs use `TabGroup`; for a
 * full-width selectable card use `SelectableCard`.
 */
export function PillGroup({ options, value, onChange }: PillGroupProps) {
  const t = useTheme();
  return (
    <HStack gap="sm">
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <Selectable
            key={o.key}
            selected={selected}
            onPress={() => onChange(o.key)}
            style={{ paddingHorizontal: t.space.md, height: t.size['40'] }}
          >
            <Text variant="labelBase" style={{ color: selected ? t.text.onBrand : t.text.primary }}>
              {o.label}
            </Text>
          </Selectable>
        );
      })}
    </HStack>
  );
}
