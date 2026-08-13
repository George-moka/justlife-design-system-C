import type { Meta, StoryObj } from '@storybook/react';
import { SpecialInstructions } from './SpecialInstructions';
import { Box } from '../../primitives/Box';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/SpecialInstructions',
  component: SpecialInstructions,
  args: { title: 'Add special instructions' },
  argTypes: { onPressAction: { action: 'action' } },
  parameters: {
    docs: {
      description: {
        component: 'Special Instructions field (Figma). Default (empty) and Added (filled) states.',
      },
    },
  },
  decorators: [
    (Story) => (
      <Box background="tertiary" padding="md" radius="lg">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof SpecialInstructions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <VStack gap="lg">
      <SpecialInstructions title="Add special instructions" />
      <SpecialInstructions
        title="Special instructions"
        value="Please leave the keys with the security guard at the lobby."
      />
    </VStack>
  ),
};
