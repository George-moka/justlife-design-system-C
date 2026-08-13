import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './ProductCard';
import { PlaceholderImage } from '../../_dev/PlaceholderImage';
import { HStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/ProductCard',
  component: ProductCard,
  args: {
    title: 'Finish Quantum',
    description: 'Be fully ready for the summer with the all-in-one pack.',
    price: '15',
    oldPrice: '30',
    image: <PlaceholderImage seed="product" />,
  },
  argTypes: { onQuantityChange: { action: 'quantity' } },
  parameters: {
    docs: { description: { component: 'Vertical product card (Figma). Add button becomes the QuantityStepper once added; card adopts Selected styling.' } },
  },
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  // Side-by-side state comparison — show unframed so both fixed-width cards fit.
  parameters: { mobileFrame: false },
  render: () => (
    <HStack gap="lg" align="flex-start">
      <ProductCard
        title="Finish Quantum"
        description="Be fully ready for the summer with the all-in-one pack."
        price="15"
        oldPrice="30"
        image={<PlaceholderImage seed="finish" />}
      />
      <ProductCard
        title="Comfort Softener"
        description="Long-lasting freshness for every wash."
        price="12"
        defaultQuantity={2}
        image={<PlaceholderImage seed="comfort" />}
      />
    </HStack>
  ),
};
