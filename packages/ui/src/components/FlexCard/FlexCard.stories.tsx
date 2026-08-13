import type { Meta, StoryObj } from '@storybook/react';
import { FlexCard } from './FlexCard';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/FlexCard',
  component: FlexCard,
  args: { title: 'Summer Ready Combo', price: '199', oldPrice: '249', currency: 'AED' },
  argTypes: { onQuantityChange: { action: 'quantity' } },
  parameters: {
    docs: { description: { component: 'Compact product/combo row (Figma Flex Card). Add button → inline stepper once added.' } },
  },
} satisfies Meta<typeof FlexCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <VStack gap="sm">
      <FlexCard title="Summer Ready Combo" price="199" oldPrice="249" />
      <FlexCard title="Deep Cleaning add-on" price="89" defaultQuantity={2} />
    </VStack>
  ),
};
