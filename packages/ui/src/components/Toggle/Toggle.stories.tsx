import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';
import { HStack, VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';

const meta = {
  title: 'Core/Toggle',
  component: Toggle,
  args: { size: 'md', disabled: false, defaultValue: false },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    onValueChange: { action: 'changed' },
  },
  parameters: {
    docs: { description: { component: 'On/off switch from the Figma Controls set. Colours are tokenised.' } },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <HStack gap="lg" align="center">
      <VStack gap="xs" align="center">
        <Toggle accessibilityLabel="off" />
        <Text variant="bodyXSmall">off</Text>
      </VStack>
      <VStack gap="xs" align="center">
        <Toggle defaultValue accessibilityLabel="on" />
        <Text variant="bodyXSmall">on</Text>
      </VStack>
      <VStack gap="xs" align="center">
        <Toggle disabled accessibilityLabel="disabled off" />
        <Text variant="bodyXSmall">disabled</Text>
      </VStack>
      <VStack gap="xs" align="center">
        <Toggle disabled defaultValue accessibilityLabel="disabled on" />
        <Text variant="bodyXSmall">disabled on</Text>
      </VStack>
    </HStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack gap="lg" align="center">
      <Toggle size="sm" defaultValue accessibilityLabel="small" />
      <Toggle size="md" defaultValue accessibilityLabel="medium" />
    </HStack>
  ),
};
