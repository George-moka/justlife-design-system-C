import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TimeSlotPicker } from './TimeSlotPicker';

const SLOTS = ['12:30 – 13:00', '13:00 – 13:30', '13:30 – 14:00', '14:00 – 14:30'];

const meta = {
  title: 'Components/TimeSlotPicker',
  component: TimeSlotPicker,
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal row of single-select time-range chips. Composes `Selectable`. Used on the booking funnel’s Date & Time step.',
      },
    },
  },
} satisfies Meta<typeof TimeSlotPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [slot, setSlot] = useState(SLOTS[0]);
    return <TimeSlotPicker slots={SLOTS} value={slot} onChange={setSlot} />;
  },
};
