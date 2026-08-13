import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Selectable } from './Selectable';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';

const meta = {
  title: 'Components/Selectable',
  component: Selectable,
  parameters: {
    docs: {
      description: {
        component:
          'The low-level **selection chip** — a bordered pressable that fills with brand colour when selected. The single source of truth for numbers, pills, dates, time slots and weekday toggles; the higher-level pickers compose it. For a full-width selectable card, use `SelectableCard`.',
      },
    },
  },
} satisfies Meta<typeof Selectable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A chip that holds its own selected state. */
export const Playground: Story = {
  render: () => {
    const t = useTheme();
    const [on, setOn] = useState(true);
    return (
      <Selectable selected={on} onPress={() => setOn((v) => !v)} style={{ paddingHorizontal: t.space.md, height: t.size['40'] }}>
        <Text variant="labelBase" style={{ color: on ? t.text.onBrand : t.text.primary }}>
          Tap me
        </Text>
      </Selectable>
    );
  },
};

/** Selected vs unselected vs disabled. */
export const States: Story = {
  render: () => {
    const t = useTheme();
    const chip = (label: string, props: object, color: string) => (
      <Selectable style={{ paddingHorizontal: t.space.md, height: t.size['40'] }} {...props}>
        <Text variant="labelBase" style={{ color }}>
          {label}
        </Text>
      </Selectable>
    );
    return (
      <View style={{ flexDirection: 'row', gap: t.space.sm }}>
        {chip('Default', { selected: false, onPress: () => {} }, t.text.primary)}
        {chip('Selected', { selected: true, onPress: () => {} }, t.text.onBrand)}
        {chip('Disabled', { selected: false, disabled: true, onPress: () => {} }, t.text.disabled)}
      </View>
    );
  },
};

/** Single-select row (the pattern `NumberSelector` / `TimeSlotPicker` build on). */
export const SingleSelectRow: Story = {
  render: () => {
    const t = useTheme();
    const [value, setValue] = useState(2);
    return (
      <View style={{ flexDirection: 'row', gap: t.space.sm }}>
        {[1, 2, 3, 4].map((n) => (
          <Selectable
            key={n}
            selected={n === value}
            onPress={() => setValue(n)}
            accessibilityLabel={`${n}`}
            style={{ width: t.size['40'], height: t.size['40'] }}
          >
            <Text variant="labelBase" style={{ color: n === value ? t.text.onBrand : t.text.primary }}>
              {n}
            </Text>
          </Selectable>
        ))}
      </View>
    );
  },
};
