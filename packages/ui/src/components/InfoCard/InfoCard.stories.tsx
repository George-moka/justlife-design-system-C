import type { Meta, StoryObj } from '@storybook/react';
import { InfoCard } from './InfoCard';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/InfoCard',
  component: InfoCard,
  args: { children: 'Share a beverage with them', tone: 'info', showIcon: true },
  argTypes: {
    tone: { control: 'inline-radio', options: ['warning', 'info', 'success', 'brand', 'accent'] },
    showIcon: { control: 'boolean' },
  },
  parameters: {
    docs: { description: { component: 'Inline info banner (Figma Info Card). Tones: warning / info / success / brand / accent.' } },
  },
} satisfies Meta<typeof InfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <VStack gap="sm">
      <InfoCard tone="info" icon="info">
        Your booking is being processed.
      </InfoCard>
      <InfoCard tone="warning" icon="triangle-alert">
        Please be available 10 minutes before your slot.
      </InfoCard>
      <InfoCard tone="success" icon="circle-check">
        Payment received — your booking is confirmed.
      </InfoCard>
      <InfoCard tone="brand" icon="badge-percent">
        You unlocked 20% off your next service.
      </InfoCard>
      <InfoCard tone="accent" icon="heart">
        Show kind gestures, they go a long way
      </InfoCard>
    </VStack>
  ),
};

export const WithAction: Story = {
  render: () => (
    <InfoCard tone="accent" icon="refresh-cw" action={{ label: 'Update', onPress: () => {} }}>
      A fresh update is waiting for you! 🚀
    </InfoCard>
  ),
};
