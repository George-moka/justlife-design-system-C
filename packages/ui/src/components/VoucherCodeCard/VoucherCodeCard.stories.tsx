import type { Meta, StoryObj } from '@storybook/react';
import { VoucherCodeCard } from './VoucherCodeCard';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/VoucherCodeCard',
  component: VoucherCodeCard,
  args: { title: 'Voucher Code' },
  argTypes: {
    onAdd: { action: 'add' },
    onRemove: { action: 'remove' },
    onDetails: { action: 'details' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Voucher / promo code card (Figma "Voucher Code Card"). Default shows an Add link; Applied shows the code with a discount badge, remove control, and details link.',
      },
    },
  },
} satisfies Meta<typeof VoucherCodeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <VStack gap="sm">
      <VoucherCodeCard title="Voucher Code" />
      <VoucherCodeCard title="Voucher Code" applied code="BOTIM432" discountLabel="20% off" />
    </VStack>
  ),
};
