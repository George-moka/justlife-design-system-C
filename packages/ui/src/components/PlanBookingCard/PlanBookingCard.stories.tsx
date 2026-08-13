import type { Meta, StoryObj } from '@storybook/react';
import { PlanBookingCard } from './PlanBookingCard';
import { VStack } from '../../primitives/Stack';

// Sample professional photos served from apps/storybook/public (demo data only).
const CLEAN_PHOTO = '/profile%20photos/profilepic_clean.png';
const HEAL_PHOTO = '/profile%20photos/profilepic_heal.png';

const meta = {
  title: 'Components/PlanBookingCard',
  component: PlanBookingCard,
  args: {
    title: 'Cleaning Subscription',
    statusLabel: 'Active',
    statusTone: 'success',
    stacked: true,
    rows: [
      { label: 'Package', value: '1 Month' },
      { label: 'Schedule', value: 'Every Mon & Wed & Fri', highlight: true },
      { label: 'Upcoming Booking', value: 'Mon, Nov 24, 09:00-09:30' },
    ],
    professional: { name: 'Hussein', rating: 4.3, category: 'clean', photo: CLEAN_PHOTO },
    buttonLabel: 'View Schedule',
    buttonIcon: 'calendar',
  },
  argTypes: { onPress: { action: 'pressed' }, onButtonPress: { action: 'button' }, onEditRating: { action: 'editRating' } },
  parameters: {
    docs: {
      description: {
        component:
          'Booking / subscription summary card. Title + status pill (tone + label), a label→value detail table, optional discount, and a footer with the professional + a primary action. `stacked` renders the depth effect for subscriptions/recurring plans. Styled with the new DS — see docs/HANDOFF.md for how it differs from the old-app screenshots.',
      },
    },
  },
} satisfies Meta<typeof PlanBookingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Subscription — stacked depth effect.
export const Subscription: Story = {};

// One-off — flat, in progress.
export const OneOff: Story = {
  args: {
    title: 'Home Cleaning',
    statusLabel: 'In Progress',
    statusTone: 'success',
    stacked: false,
    rows: [
      { label: 'Schedule', value: 'One-off' },
      { label: 'Date', value: 'Mon, Nov 24, 09:00-09:30' },
    ],
    professional: { name: 'Hussein', rating: 4.3, category: 'clean', photo: CLEAN_PHOTO },
    buttonLabel: 'Manage Booking',
    buttonIcon: 'settings',
  },
};

// Recurring weekly — flat, professional assigned, with a bold current booking.
export const Recurring: Story = {
  args: {
    title: 'Home Cleaning',
    statusLabel: 'Professional Assigned',
    statusTone: 'success',
    stacked: false,
    rows: [
      { label: 'Schedule', value: 'Every Monday' },
      { label: 'Current Booking', value: 'Mon, Nov 24, 09:00-09:30', bold: true },
      { label: 'Next Booking', value: 'Mon, Dec 1, 09:00-09:30' },
    ],
    professional: { name: 'Hussein', rating: 4.3, category: 'clean', photo: CLEAN_PHOTO },
    buttonLabel: 'Manage Booking',
    buttonIcon: 'settings',
  },
};

// One-off cancelled — error tone (with the auto alert icon).
export const Cancelled: Story = {
  args: {
    title: "Women's Salon",
    statusLabel: 'Cancelled',
    statusTone: 'error',
    stacked: false,
    rows: [
      { label: 'Schedule', value: 'One-off' },
      { label: 'Date', value: 'Mon, Nov 24, 09:00-09:30' },
    ],
    professional: { name: 'Hussein', rating: 4.3, category: 'clean', photo: CLEAN_PHOTO },
    buttonLabel: 'Book Again',
    buttonIcon: 'rotate-cw',
  },
};

// Completed — info tone, with the user's own rating + edit affordance.
export const Completed: Story = {
  args: {
    title: 'Home Cleaning',
    statusLabel: 'Completed',
    statusTone: 'info',
    stacked: false,
    rows: [
      { label: 'Schedule', value: 'One-off' },
      { label: 'Date', value: 'Mon, Nov 24, 09:00-09:30' },
    ],
    professional: { name: 'Leila', rating: 4.7, category: 'heal', photo: HEAL_PHOTO },
    userRating: 5.0,
    onEditRating: () => {},
    buttonLabel: 'Book Again',
    buttonIcon: 'rotate-cw',
  },
};

// All states together.
export const Gallery: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <VStack gap="lg">
      <PlanBookingCard
        title="Cleaning Subscription"
        statusLabel="Active"
        statusTone="success"
        stacked
        rows={[
          { label: 'Package', value: '1 Month' },
          { label: 'Schedule', value: 'Every Mon & Wed & Fri', highlight: true },
          { label: 'Upcoming Booking', value: 'Mon, Nov 24, 09:00-09:30' },
        ]}
        professional={{ name: 'Hussein', rating: 4.3, category: 'clean', photo: CLEAN_PHOTO }}
        buttonLabel="View Schedule"
        buttonIcon="calendar"
        onButtonPress={() => {}}
      />
      <PlanBookingCard
        title="Home Cleaning"
        statusLabel="Professional Assigned"
        statusTone="success"
        rows={[
          { label: 'Schedule', value: 'Every Monday' },
          { label: 'Current Booking', value: 'Mon, Nov 24, 09:00-09:30', bold: true },
          { label: 'Next Booking', value: 'Mon, Dec 1, 09:00-09:30' },
        ]}
        professional={{ name: 'Hussein', rating: 4.3, category: 'clean', photo: CLEAN_PHOTO }}
        buttonLabel="Manage Booking"
        buttonIcon="settings"
        onButtonPress={() => {}}
      />
      <PlanBookingCard
        title="Women's Salon"
        statusLabel="Cancelled"
        statusTone="error"
        rows={[
          { label: 'Schedule', value: 'One-off' },
          { label: 'Date', value: 'Mon, Nov 24, 09:00-09:30' },
        ]}
        professional={{ name: 'Hussein', rating: 4.3, category: 'clean', photo: CLEAN_PHOTO }}
        buttonLabel="Book Again"
        buttonIcon="rotate-cw"
        onButtonPress={() => {}}
      />
      <PlanBookingCard
        title="Home Cleaning"
        statusLabel="Completed"
        statusTone="info"
        rows={[
          { label: 'Schedule', value: 'One-off' },
          { label: 'Date', value: 'Mon, Nov 24, 09:00-09:30' },
        ]}
        professional={{ name: 'Leila', rating: 4.7, category: 'heal', photo: HEAL_PHOTO }}
        userRating={5.0}
        onEditRating={() => {}}
        buttonLabel="Book Again"
        buttonIcon="rotate-cw"
        onButtonPress={() => {}}
      />
    </VStack>
  ),
};
