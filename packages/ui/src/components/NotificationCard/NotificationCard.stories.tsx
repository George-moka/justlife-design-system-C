import type { Meta, StoryObj } from '@storybook/react';
import { NotificationCard } from './NotificationCard';
import { PlaceholderImage } from '../../_dev/PlaceholderImage';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/NotificationCard',
  component: NotificationCard,
  args: {
    title: 'Pre-Visit Assistance',
    body: 'Need to share any details before the session? Connect with the professional to ensure they bring the right tools.',
    time: 'Just now',
    unread: true,
    showChevron: true,
  },
  argTypes: { onPress: { action: 'pressed' }, onCheckedChange: { action: 'checked' } },
  parameters: {
    docs: { description: { component: 'Notification list card (Figma). Unread/Read, optional avatar, checkbox, chevron.' } },
  },
} satisfies Meta<typeof NotificationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { avatar: <PlaceholderImage seed="pro" /> },
};

export const States: Story = {
  render: () => (
    <VStack gap="sm">
      <NotificationCard
        title="Pre-Visit Assistance"
        body="Connect with the professional to ensure they bring the right tools and parts."
        time="Just now"
        unread
        avatar={<PlaceholderImage seed="pro1" />}
      />
      <NotificationCard
        title="Booking confirmed"
        body="Your AC deep cleaning is scheduled for tomorrow at 10:00 AM."
        time="2h ago"
        avatar={<PlaceholderImage seed="pro2" />}
      />
      <NotificationCard
        title="Select notifications"
        body="Tap the checkbox to manage multiple notifications at once."
        time="Yesterday"
        showCheckbox
        showChevron={false}
      />
    </VStack>
  ),
};
