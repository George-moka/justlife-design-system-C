import type { Meta, StoryObj } from '@storybook/react';
import { ErrorState } from './ErrorState';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/ErrorState',
  component: ErrorState,
  args: {
    icon: 'cloud-off',
    title: 'Something went wrong',
    description: 'Please check your connection and try again.',
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
          'Centred failed-load state with a Retry action — the "error" of the loading → empty → error trio. Built on `EmptyState`, but reads as broken (error-geared copy + a more present icon tone), not empty.',
      },
    },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { onRetry: () => {} },
};

export const Variants: Story = {
  render: () => (
    <VStack gap="2xl">
      <ErrorState onRetry={() => {}} />
      <ErrorState
        icon="server-crash"
        title="Couldn’t load your bookings"
        description="We’re having trouble reaching the server."
        onRetry={() => {}}
      />
      <ErrorState
        icon="search-x"
        title="Search failed"
        description="Something went wrong with your search."
        retryLabel="Try again"
        onRetry={() => {}}
      />
    </VStack>
  ),
};

/** Retry emphasis — filled (primary) vs soft (secondary) vs light (outline). The calm default is `outline`. */
export const Emphasis: Story = {
  render: () => (
    <VStack gap="2xl">
      <ErrorState title="Filled (primary)" description="Solid brand — reserve for high-intent CTAs." retryVariant="primary" onRetry={() => {}} />
      <ErrorState title="Soft (secondary)" description="Tinted fill — present but not loud." retryVariant="secondary" onRetry={() => {}} />
      <ErrorState title="Light (outline)" description="Bordered — calmest; the default for recovery." retryVariant="outline" onRetry={() => {}} />
    </VStack>
  ),
};

/** Without `onRetry` — message only (e.g. when retry isn't applicable). */
export const NoRetry: Story = {
  args: { title: 'This page is unavailable', description: 'Please come back later.' },
};
