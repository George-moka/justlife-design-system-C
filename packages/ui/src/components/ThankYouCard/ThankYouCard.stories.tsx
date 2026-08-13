import type { Meta, StoryObj } from '@storybook/react';
import { ThankYouCard } from './ThankYouCard';
import { Icon } from '../Icon';
import { VStack } from '../../primitives/Stack';
import { View } from 'react-native';

// Sample professional photo served from apps/storybook/public (demo data only).
const HEAL_PHOTO = '/profile%20photos/profilepic_heal.png';

const meta = {
  title: 'Components/ThankYouCard',
  component: ThankYouCard,
  args: {
    title: 'Professional Assigned',
    message: "We'll share the professional's details before arrival.",
    professional: { name: 'Leila Mary', rating: 4.7, category: 'heal', photo: HEAL_PHOTO },
  },
  argTypes: { onPress: { action: 'pressed' } },
  parameters: {
    docs: {
      description: {
        component:
          'Post-booking status card (Figma "Thank You Card"). A tappable brand title + message, an optional trailing professional (or status illustration), and an optional pill action bar. Adapted to the new DS — see docs/HANDOFF.md.',
      },
    },
  },
} satisfies Meta<typeof ThankYouCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithProfessional: Story = { args: { onPress: () => {} } };

// Confirmed — no professional yet; a status illustration in the trailing slot.
export const Confirmed: Story = {
  args: {
    title: 'Booking Confirmed',
    message: "We'll match you with a professional and share their details soon.",
    professional: undefined,
    onPress: () => {},
    illustration: (
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          backgroundColor: '#B3EEFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="circle-check" size="lg" color="#00A8DC" />
      </View>
    ),
  },
};

// Assigned + action bar (pill buttons).
export const WithActions: Story = {
  args: {
    title: 'Professional Assigned',
    message: 'Leila will arrive on Mon, Nov 24 between 09:00–09:30.',
    professional: { name: 'Leila Mary', rating: 4.7, category: 'heal', photo: HEAL_PHOTO },
    onPress: () => {},
    actions: [
      { label: 'Reschedule', icon: 'calendar', onPress: () => {} },
      { label: 'Cancel', icon: 'x', onPress: () => {} },
    ],
  },
};

// Cancelled — state conveyed in the message.
export const Cancelled: Story = {
  args: {
    title: 'View booking details',
    message: 'Your session has been cancelled. You can book again anytime.',
    professional: { name: 'Leila Mary', rating: 4.7, category: 'heal', photo: HEAL_PHOTO },
    onPress: () => {},
    actions: [{ label: 'Book Again', icon: 'rotate-cw', onPress: () => {} }],
  },
};

export const Gallery: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <VStack gap="md">
      <ThankYouCard
        title="Booking Confirmed"
        message="We'll match you with a professional and share their details soon."
        onPress={() => {}}
        illustration={
          <View style={{ width: 56, height: 56, borderRadius: 999, backgroundColor: '#B3EEFF', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle-check" size="lg" color="#00A8DC" />
          </View>
        }
      />
      <ThankYouCard
        title="Professional Assigned"
        message="Leila will arrive on Mon, Nov 24 between 09:00–09:30."
        professional={{ name: 'Leila Mary', rating: 4.7, category: 'heal', photo: HEAL_PHOTO }}
        onPress={() => {}}
        actions={[
          { label: 'Reschedule', icon: 'calendar', onPress: () => {} },
          { label: 'Cancel', icon: 'x', onPress: () => {} },
        ]}
      />
      <ThankYouCard
        title="View booking details"
        message="Your session has been cancelled. You can book again anytime."
        professional={{ name: 'Leila Mary', rating: 4.7, category: 'heal', photo: HEAL_PHOTO }}
        onPress={() => {}}
        actions={[{ label: 'Book Again', icon: 'rotate-cw', onPress: () => {} }]}
      />
    </VStack>
  ),
};
