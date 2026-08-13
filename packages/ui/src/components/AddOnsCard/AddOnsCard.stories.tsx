import type { Meta, StoryObj } from '@storybook/react';
import { AddOnsCard } from './AddOnsCard';
import { PlaceholderImage } from '../../_dev/PlaceholderImage';
import { HStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/AddOnsCard',
  component: AddOnsCard,
  args: {
    title: 'Balcony Cleaning',
    price: '15',
    oldPrice: '10',
    image: <PlaceholderImage seed="addon" />,
  },
  argTypes: { onQuantityChange: { action: 'quantity' }, onLearnMore: { action: 'learn-more' } },
  parameters: {
    docs: {
      description: {
        component:
          'Add-on tile (Figma "Add-ons Card"). Image with a floating add control (a `+` that becomes a quantity stepper once added), title, Learn More link, and price.',
      },
    },
  },
} satisfies Meta<typeof AddOnsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <HStack gap="md" align="flex-start">
      <AddOnsCard title="Balcony Cleaning" price="15" oldPrice="10" image={<PlaceholderImage seed="balcony" />} />
      <AddOnsCard
        title="Ironing Service"
        price="20"
        defaultQuantity={1}
        image={<PlaceholderImage seed="ironing" />}
      />
    </HStack>
  ),
};
