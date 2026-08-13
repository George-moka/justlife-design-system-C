import type { Meta, StoryObj } from '@storybook/react';
import { RatingSummary } from './RatingSummary';
import { HStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/RatingSummary',
  component: RatingSummary,
  args: {
    rating: '4.88',
    reviewCount: '27K reviews',
    size: 'md',
  },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  parameters: {
    docs: {
      description: {
        component: 'Aggregate rating metric (Figma "Rating Summary"). Star + average rating with an optional review count. Sizes: sm / md / lg.',
      },
    },
  },
} satisfies Meta<typeof RatingSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <HStack gap="xl" align="flex-end">
      <RatingSummary rating="4.88" reviewCount="27K reviews" size="sm" />
      <RatingSummary rating="4.88" reviewCount="27K reviews" size="md" />
      <RatingSummary rating="4.88" reviewCount="27K reviews" size="lg" />
    </HStack>
  ),
};
