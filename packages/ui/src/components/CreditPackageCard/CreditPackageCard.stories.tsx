import type { Meta, StoryObj } from '@storybook/react';
import { CreditPackageCard } from './CreditPackageCard';
import { HStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/CreditPackageCard',
  component: CreditPackageCard,
  args: {
    tier: 'BASIC',
    saveLabel: 'Save 33%',
    pay: '250',
    get: '375',
    validity: '60 day validity.',
  },
  argTypes: { onBuy: { action: 'buy' } },
  parameters: {
    docs: {
      description: {
        component:
          'Credit package / pricing-tier card (Figma "Credit Package Card"). Brand-gradient background, savings badge, pay/get amounts, and a Buy button. Tiers differ only in content.',
      },
    },
  },
} satisfies Meta<typeof CreditPackageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tiers: Story = {
  // Three tiers side by side exceed a phone width — show this comparison unframed.
  parameters: { mobileFrame: false },
  render: () => (
    <HStack gap="md" align="flex-start">
      <CreditPackageCard tier="BASIC" saveLabel="Save 33%" pay="250" get="375" validity="60 day validity." />
      <CreditPackageCard tier="SMART" saveLabel="Save 50%" pay="500" get="750" validity="90 day validity." />
      <CreditPackageCard tier="SUPER" saveLabel="Save 60%" pay="1000" get="1600" validity="120 day validity." />
    </HStack>
  ),
};
