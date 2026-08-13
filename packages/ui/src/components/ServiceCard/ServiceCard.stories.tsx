import type { Meta, StoryObj } from '@storybook/react';
import { ServiceCard } from './ServiceCard';
import { PlaceholderImage } from '../../_dev/PlaceholderImage';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/ServiceCard',
  component: ServiceCard,
  args: {
    title: 'Classic Mani-Pedi',
    duration: '120 min',
    description: 'A relaxing classic manicure and pedicure with premium products.',
    price: '100',
    oldPrice: '140',
    discountLabel: '20% off',
    cta: 'add',
    image: <PlaceholderImage seed="service" />,
  },
  argTypes: {
    cta: { control: 'inline-radio', options: ['add', 'select'] },
    onAdd: { action: 'add' },
    onSelect: { action: 'select' },
    onQuantityChange: { action: 'quantity' },
    onPress: { action: 'press' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Primary service listing card (Figma "Service Card"). Media + options tag, title/duration/description, price row with discount, a CTA (Add / Stepper / Select), Selected state, and an optional included-items panel.',
      },
    },
  },
} satisfies Meta<typeof ServiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <VStack gap="sm">
      <ServiceCard
        title="Classic Mani-Pedi"
        duration="120 min"
        description="A relaxing classic manicure and pedicure with premium products."
        price="100"
        oldPrice="140"
        discountLabel="20% off"
        cta="add"
        showChevron
        image={<PlaceholderImage seed="manipedi" />}
      />
      <ServiceCard
        title="Deep Cleaning"
        duration="180 min"
        description="Full home deep clean by a vetted team."
        price="189"
        defaultQuantity={2}
        selected
        image={<PlaceholderImage seed="deepclean" />}
      />
      <ServiceCard
        title="Gel Polish Add-on"
        duration="30 min"
        price="40"
        cta="select"
        optionsTag="5 options"
        image={<PlaceholderImage seed="gel" />}
        details={{
          heading: 'What is included',
          editLabel: 'Edit Combo',
          items: ['Classic Manicure', 'Classic Pedicure', 'Essie / Kinetics products & disposable sheets'],
        }}
      />
    </VStack>
  ),
};
