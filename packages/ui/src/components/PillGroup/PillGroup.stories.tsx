import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PillGroup } from './PillGroup';

const meta = {
  title: 'Components/PillGroup',
  component: PillGroup,
  parameters: {
    docs: {
      description: {
        component:
          'A single-select row of label pills (e.g. Weekly / Every Two Weeks). Composes `Selectable`. For navigation tabs use `TabGroup`.',
      },
    },
  },
} satisfies Meta<typeof PillGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cadence: Story = {
  render: () => {
    const [value, setValue] = useState('weekly');
    return (
      <PillGroup
        value={value}
        onChange={setValue}
        options={[
          { key: 'weekly', label: 'Weekly' },
          { key: 'biweekly', label: 'Every Two Weeks' },
        ]}
      />
    );
  },
};

export const YesNo: Story = {
  render: () => {
    const [value, setValue] = useState('yes');
    return (
      <PillGroup
        value={value}
        onChange={setValue}
        options={[
          { key: 'yes', label: 'Yes' },
          { key: 'no', label: 'No' },
        ]}
      />
    );
  },
};
