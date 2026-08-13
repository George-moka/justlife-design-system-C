import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Core/Input',
  component: Input,
  args: { label: 'Email address', placeholder: 'you@example.com' },
  parameters: {
    docs: {
      description: {
        component:
          'Single-line text field with label, helper text, and an error state. Touch target is ≥44px; the label is the accessible name.',
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <VStack gap="lg" style={{ width: 320 }}>
      <Input label="Default" placeholder="Type here" />
      <Input label="With helper" placeholder="+971 5x xxx xxxx" helperText="We'll text your booking updates." />
      <Input label="Error" value="not-an-email" errorText="Enter a valid email address." />
      <Input label="Disabled" placeholder="Unavailable" disabled />
    </VStack>
  ),
};
