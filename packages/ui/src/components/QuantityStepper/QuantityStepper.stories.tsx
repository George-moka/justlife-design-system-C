import type { Meta, StoryObj } from '@storybook/react';
import { QuantityStepper } from './QuantityStepper';
import { HStack, VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';

const meta = {
  title: 'Core/QuantityStepper',
  component: QuantityStepper,
  args: { defaultValue: 2, size: 'md', min: 1 },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    onChange: { action: 'changed' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Quantity stepper from the Figma set. Minus disables at `min`, plus at `max`; value 0 collapses to an Add button.',
      },
    },
  },
} satisfies Meta<typeof QuantityStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <HStack gap="lg" align="center">
      <QuantityStepper size="sm" defaultValue={2} />
      <QuantityStepper size="md" defaultValue={2} />
      <QuantityStepper size="lg" defaultValue={2} />
    </HStack>
  ),
};

export const States: Story = {
  render: () => (
    <HStack gap="lg" align="flex-start">
      <VStack gap="xs" align="center">
        <QuantityStepper defaultValue={0} />
        <Text variant="bodyXSmall">add (0)</Text>
      </VStack>
      <VStack gap="xs" align="center">
        <QuantityStepper defaultValue={1} min={1} />
        <Text variant="bodyXSmall">at min</Text>
      </VStack>
      <VStack gap="xs" align="center">
        <QuantityStepper defaultValue={5} min={1} max={5} />
        <Text variant="bodyXSmall">at max</Text>
      </VStack>
      <VStack gap="xs" align="center">
        <QuantityStepper defaultValue={3} disabled />
        <Text variant="bodyXSmall">disabled</Text>
      </VStack>
    </HStack>
  ),
};
