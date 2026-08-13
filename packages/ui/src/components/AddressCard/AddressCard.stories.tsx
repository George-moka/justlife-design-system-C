import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AddressCard } from './AddressCard';
import { Icon } from '../Icon';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/AddressCard',
  component: AddressCard,
  args: {
    label: 'Home',
    address: 'Villa 12, Street 7, Jumeirah 1, Dubai',
    note: 'Apartment / Villa',
    defaultBadge: true,
  },
  argTypes: { onPress: { action: 'pressed' }, onEdit: { action: 'edit' }, onDelete: { action: 'delete' } },
  parameters: {
    docs: {
      description: {
        component:
          'Saved-address card (Figma "Address Selection → Selectable Item"). Type icon + label (+ optional "Default" badge), address line, optional note, and trailing radio / edit / delete actions. Selectable mode adds a radio and selected styling.',
      },
    },
  },
} satisfies Meta<typeof AddressCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The checkout "current address" form — the trailing **Change** action sits inside the card and the
 * whole row is tappable, mirroring `PaymentMethodCard`'s current-method card so the two "current
 * selection" cards on a checkout read identically.
 */
export const CurrentWithChange: Story = {
  args: { note: undefined, trailing: 'Change', trailingTone: 'action' },
};

// Selectable list — radio + selected styling; tap to choose (Figma "Address Selection").
export const Selectable: Story = {
  render: function SelectableAddresses() {
    const [chosen, setChosen] = useState('home');
    return (
      <VStack gap="sm">
        <AddressCard
          typeIcon={<Icon name="house" size="sm" />}
          label="Home"
          address="Villa 12, Street 7, Jumeirah 1, Dubai"
          note="Default delivery address"
          defaultBadge
          selected={chosen === 'home'}
          onPress={() => setChosen('home')}
        />
        <AddressCard
          typeIcon={<Icon name="briefcase" size="sm" />}
          label="Work"
          address="Office 1402, Boulevard Plaza Tower 1, Downtown"
          note="Mon–Fri, 9am – 6pm"
          selected={chosen === 'work'}
          onPress={() => setChosen('work')}
        />
        <AddressCard
          typeIcon={<Icon name="map-pin" size="sm" />}
          label="Mom's place"
          address="Apt 5B, Al Wasl Road, Dubai"
          note="Ring the doorbell twice"
          selected={chosen === 'mom'}
          onPress={() => setChosen('mom')}
        />
      </VStack>
    );
  },
};

// Manage list — edit + delete actions instead of a radio (Figma manage-addresses view).
export const Manage: Story = {
  render: () => (
    <VStack gap="sm">
      <AddressCard
        typeIcon={<Icon name="house" size="sm" />}
        label="Home"
        address="Villa 12, Street 7, Jumeirah 1, Dubai"
        defaultBadge
        onEdit={() => {}}
        onDelete={() => {}}
      />
      <AddressCard
        typeIcon={<Icon name="briefcase" size="sm" />}
        label="Work"
        address="Office 1402, Boulevard Plaza Tower 1, Downtown"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </VStack>
  ),
};

// Out-of-service-area address — error message line.
export const WithError: Story = {
  args: {
    label: "Mom's place",
    address: 'Apt 5B, Al Wasl Road, Dubai',
    note: undefined,
    defaultBadge: false,
    errorMessage: "We don't serve this area yet.",
    selected: false,
  },
};
