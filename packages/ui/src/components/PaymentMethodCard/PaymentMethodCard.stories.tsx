import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PaymentMethodCard } from './PaymentMethodCard';
import { PaymentLogo } from './PaymentLogo';
import { Icon } from '../Icon';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/PaymentMethodCard',
  component: PaymentMethodCard,
  args: {
    icon: <PaymentLogo name="visa" label="Visa" />,
    title: 'Visa',
    number: '•••• 4242',
    trailing: 'Default',
  },
  argTypes: { onPress: { action: 'pressed' } },
  parameters: {
    docs: {
      description: {
        component:
          'Payment method row (Figma "Payment Method Card"). Icon + title (+ masked number) + trailing label. The icon is a slot — generic types use Lucide; brand logos (Visa/Mastercard/Apple Pay/…) plug in as assets.',
      },
    },
  },
} satisfies Meta<typeof PaymentMethodCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// Selectable mode — a radio + selected styling; tap to choose (Figma "Payment Method").
export const Selectable: Story = {
  render: function SelectableMethods() {
    const [chosen, setChosen] = useState('visa');
    return (
      <VStack gap="sm">
        <PaymentMethodCard
          icon={<PaymentLogo name="visa" label="Visa" />}
          title="Visa"
          number="•••• 4242"
          selected={chosen === 'visa'}
          onPress={() => setChosen('visa')}
        />
        <PaymentMethodCard
          icon={<PaymentLogo name="mastercard" label="Mastercard" />}
          title="Mastercard"
          number="•••• 8210"
          selected={chosen === 'mc'}
          onPress={() => setChosen('mc')}
        />
        <PaymentMethodCard
          icon={<Icon name="banknote" size="lg" />}
          title="Cash"
          selected={chosen === 'cash'}
          onPress={() => setChosen('cash')}
        />
      </VStack>
    );
  },
};

export const Methods: Story = {
  render: () => (
    <VStack gap="sm">
      <PaymentMethodCard icon={<PaymentLogo name="visa" label="Visa" />} title="Visa" number="•••• 4242" trailing="Default" onPress={() => {}} />
      <PaymentMethodCard icon={<PaymentLogo name="mastercard" label="Mastercard" />} title="Mastercard" number="•••• 8210" trailing="Change" onPress={() => {}} />
      <PaymentMethodCard icon={<PaymentLogo name="applePay" label="Apple Pay" />} title="Apple Pay" trailing="Connected" onPress={() => {}} />
      <PaymentMethodCard icon={<PaymentLogo name="googlePay" label="Google Pay" />} title="Google Pay" trailing="Connect" onPress={() => {}} />
      <PaymentMethodCard icon={<PaymentLogo name="tabby" label="Tabby" />} title="Tabby" trailing="4 interest-free" onPress={() => {}} />
      <PaymentMethodCard icon={<Icon name="credit-card" size="lg" />} title="Credit / Debit Card" trailing="Add" onPress={() => {}} />
      <PaymentMethodCard icon={<Icon name="banknote" size="lg" />} title="Cash" trailing="Selected" onPress={() => {}} />
    </VStack>
  ),
};
