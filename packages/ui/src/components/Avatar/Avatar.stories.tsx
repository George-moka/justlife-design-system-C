import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';
import { HStack } from '../../primitives/Stack';

const meta = {
  title: 'Core/Avatar',
  component: Avatar,
  args: { name: 'Cem Mirkelam', size: 'md', tone: 'brand' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['brand', 'neutral'] },
    name: { control: 'text' },
    initials: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Circular initials avatar (Justlife has no profile photos). Initials derive from `name` ("Cem Mirkelam" → "CM"); `tone` picks the chip colour (brand / neutral).',
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <HStack gap="md" align="center">
      <Avatar name="Cem Mirkelam" size="sm" />
      <Avatar name="Cem Mirkelam" size="md" />
      <Avatar name="Cem Mirkelam" size="lg" />
    </HStack>
  ),
};

export const Tones: Story = {
  render: () => (
    <HStack gap="md" align="center">
      <Avatar name="Cem Mirkelam" tone="brand" />
      <Avatar name="Sara Lee" tone="neutral" />
    </HStack>
  ),
};
