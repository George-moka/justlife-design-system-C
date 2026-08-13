import type { Meta, StoryObj } from '@storybook/react';
import { RatedCard } from './RatedCard';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/RatedCard',
  component: RatedCard,
  args: {
    title: 'You Rated Leila',
    ratingLabel: 'Your rating',
    rating: 5,
  },
  argTypes: { onAddTip: { action: 'add-tip' } },
  parameters: {
    docs: {
      description: {
        component:
          'Post-service rating card (Figma "Rated Card"). States: Default (rating only), Tip (shows the tip amount), and Add Tip (shows an Add Tip button).',
      },
    },
  },
} satisfies Meta<typeof RatedCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <VStack gap="sm">
      <RatedCard title="You Rated Leila" ratingLabel="Your rating" rating={5} />
      <RatedCard title="You Rated Leila" ratingLabel="Your rating" rating={4} tipLabel="Tip added" tipAmount="10" />
      <RatedCard title="You Rated Leila" ratingLabel="Your rating" rating={5} tipLabel="Add a tip" onAddTip={() => {}} />
    </VStack>
  ),
};
