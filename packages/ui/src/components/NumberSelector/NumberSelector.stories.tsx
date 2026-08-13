import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { NumberSelector } from './NumberSelector';

const meta = {
  title: 'Components/NumberSelector',
  component: NumberSelector,
  parameters: {
    docs: {
      description: {
        component:
          'A horizontal row of single-select number chips (`min`…`count`), for picking a count like hours or professionals. Composes `Selectable`. For a −/+ stepper, use `QuantityStepper`.',
      },
    },
  },
} satisfies Meta<typeof NumberSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hours: Story = {
  render: () => {
    const [hours, setHours] = useState(2);
    return <NumberSelector count={8} value={hours} onChange={setHours} />;
  },
};

export const Professionals: Story = {
  render: () => {
    const [pros, setPros] = useState(1);
    return <NumberSelector count={4} value={pros} onChange={setPros} />;
  },
};
