import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Question } from './Question';
import { TimeSlotPicker } from '../TimeSlotPicker';

const SLOTS = ['12:30 – 13:00', '13:00 – 13:30', '13:30 – 14:00'];

const meta = {
  title: 'Components/Question',
  component: Question,
  args: { title: 'When would you like your service?', info: false },
  argTypes: { info: { control: 'boolean' }, title: { control: 'text' } },
  parameters: {
    docs: {
      description: {
        component:
          'A labelled form section — a title (optional inline info icon) over its control. Title is inset; children are full-bleed so horizontal pickers manage their own edge inset. Stacks the booking-funnel steps.',
      },
    },
  },
} satisfies Meta<typeof Question>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [slot, setSlot] = useState(SLOTS[0]);
    return (
      <Question {...args}>
        <TimeSlotPicker slots={SLOTS} value={slot} onChange={setSlot} />
      </Question>
    );
  },
};

export const WithInfo: Story = {
  args: { title: 'Service fee', info: true },
  render: (args) => {
    const [slot, setSlot] = useState(SLOTS[0]);
    return (
      <Question {...args}>
        <TimeSlotPicker slots={SLOTS} value={slot} onChange={setSlot} />
      </Question>
    );
  },
};
