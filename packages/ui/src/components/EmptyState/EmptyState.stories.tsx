import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: {
    icon: 'calendar',
    title: 'No upcoming bookings',
    description: 'When you book a service, it’ll show up here.',
  },
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Centred, low-emphasis placeholder for an empty list/screen: a muted icon over a ghost title + hint, with an optional primary action.',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithAction: Story = {
  args: {
    icon: 'search',
    title: 'No results found',
    description: 'Try a different service or area.',
    action: { label: 'Browse services', icon: 'compass', onPress: () => {} },
  },
};

export const TitleOnly: Story = {
  args: { icon: 'bell', title: 'You’re all caught up', description: undefined },
};

export const Variants: Story = {
  render: () => (
    <VStack gap="2xl">
      <EmptyState icon="calendar" title="No past bookings" description="Your completed and cancelled bookings will show here." />
      <EmptyState icon="heart" title="No favorites yet" description="Tap the heart on a service to save it here." />
      <EmptyState
        icon="wallet"
        title="Your wallet is empty"
        description="Add credit to pay faster at checkout."
        action={{ label: 'Add credit', icon: 'plus', onPress: () => {} }}
      />
    </VStack>
  ),
};
