import type { Meta, StoryObj } from '@storybook/react';
import { CashbackCard } from './CashbackCard';
import { VStack } from '../../primitives/Stack';

const DESCRIPTION =
  'This credit is only for bookings that take place on Sunday, Tuesday, Wednesday, Thursday, Friday, Saturday.';

const meta = {
  title: 'Components/CashbackCard',
  component: CashbackCard,
  args: {
    title: 'Cashback - Home Cleaning',
    amount: '35.00',
    description: DESCRIPTION,
    expiry: 'Expires on Jun 28, 2022',
  },
  argTypes: { onApply: { action: 'apply' } },
  parameters: {
    docs: {
      description: {
        component:
          'Promotional cashback/credit card (Figma "Cashback Card"). States: Default (Apply button) and Applied (selected styling + outline button).',
      },
    },
  },
} satisfies Meta<typeof CashbackCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <VStack gap="md">
      <CashbackCard
        title="Cashback - Home Cleaning"
        amount="35.00"
        description={DESCRIPTION}
        expiry="Expires on Jun 28, 2022"
      />
      <CashbackCard
        title="Cashback - Home Cleaning"
        amount="35.00"
        description={DESCRIPTION}
        expiry="Expires on Jun 28, 2022"
        applied
      />
    </VStack>
  ),
};
