import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';
import { HStack, VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';

const meta = {
  title: 'Core/Checkbox',
  component: Checkbox,
  args: { size: 'md', disabled: false, defaultChecked: false, indeterminate: false },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    onChange: { action: 'changed' },
  },
  parameters: {
    docs: { description: { component: 'Checkbox from the Figma Controls set. Colours are tokenised.' } },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <HStack gap="lg" align="center">
      {[
        { label: 'unchecked', props: {} },
        { label: 'checked', props: { defaultChecked: true } },
        { label: 'indeterminate', props: { indeterminate: true } },
        { label: 'disabled', props: { disabled: true } },
        { label: 'disabled checked', props: { disabled: true, defaultChecked: true } },
      ].map(({ label, props }) => (
        <VStack key={label} gap="xs" align="center" style={{ width: 96 }}>
          <Checkbox accessibilityLabel={label} {...props} />
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
      <Checkbox size="sm" defaultChecked accessibilityLabel="small" />
      <Checkbox size="md" defaultChecked accessibilityLabel="medium" />
    </HStack>
  ),
};
