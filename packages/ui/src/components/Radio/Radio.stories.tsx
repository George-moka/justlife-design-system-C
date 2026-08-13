import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';
import { HStack, VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';

const meta = {
  title: 'Core/Radio',
  component: Radio,
  args: { size: 'md', disabled: false, defaultSelected: false },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    onChange: { action: 'changed' },
  },
  parameters: {
    docs: { description: { component: 'Radio button from the Figma Controls set. Colours are tokenised.' } },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <HStack gap="lg" align="center">
      {[
        { label: 'unselected', props: {} },
        { label: 'selected', props: { defaultSelected: true } },
        { label: 'disabled', props: { disabled: true } },
        { label: 'disabled selected', props: { disabled: true, defaultSelected: true } },
      ].map(({ label, props }) => (
        <VStack key={label} gap="xs" align="center" style={{ width: 96 }}>
          <Radio accessibilityLabel={label} {...props} />
          <Text variant="bodyXSmall" align="center">
            {label}
          </Text>
        </VStack>
      ))}
    </HStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack gap="lg" align="center">
      <Radio size="sm" defaultSelected accessibilityLabel="small" />
      <Radio size="md" defaultSelected accessibilityLabel="medium" />
    </HStack>
  ),
};
