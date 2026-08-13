import type { Meta, StoryObj } from '@storybook/react';
import { BookingStatusCard } from './BookingStatusCard';
import { VStack } from '../../primitives/Stack';

const pro = {
  name: 'Leila Mary',
  rating: '4.7',
  category: 'heal' as const,
  photo: '/profile%20photos/profilepic_heal.png',
};

const meta = {
  title: 'Components/BookingStatusCard',
  component: BookingStatusCard,
  args: {
    status: 'Professional Assigned',
    message: 'We’ll arrive between 13.00-14.00.',
    professional: pro,
  },
  argTypes: { onPress: { action: 'pressed' } },
  parameters: {
    docs: {
      description: {
        component:
          'Booking status card (Figma "Booking Status Card"). Status headline + chevron and a message, with an optional professional block. Status is brand-coloured, or error when cancelled.',
      },
    },
  },
} satisfies Meta<typeof BookingStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <VStack gap="sm">
      <BookingStatusCard status="Professional Assigned" message="We’ll arrive between 13.00-14.00." professional={pro} />
      <BookingStatusCard
        status="Confirmed"
        message="Your booking is confirmed."
        professional={{ ...pro, confirmed: true }}
      />
      <BookingStatusCard status="On the Way" message="Leila is on the way to your location." professional={pro} />
      <BookingStatusCard status="Cancelled" message="This booking was cancelled." cancelled professional={pro} />
      <BookingStatusCard status="Multi Professional" message="2 professionals assigned to this booking." />
    </VStack>
  ),
};
