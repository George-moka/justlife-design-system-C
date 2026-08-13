import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';
import { WeekdayPicker } from './WeekdayPicker';

const meta = {
  title: 'Components/WeekdayPicker',
  component: WeekdayPicker,
  parameters: {
    docs: {
      description: {
        component:
          'A row of seven multi-select day chips (single-letter labels) for choosing which weekdays a recurring booking repeats on. Composes `Selectable`.',
      },
    },
  },
} satisfies Meta<typeof WeekdayPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [days, setDays] = useState<string[]>(['wed', 'sat']);
    const toggle = (k: string) => setDays((d) => (d.includes(k) ? d.filter((x) => x !== k) : [...d, k]));
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <WeekdayPicker value={days} onToggle={toggle} />
      </View>
    );
  },
};
