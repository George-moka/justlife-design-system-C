import type { Meta, StoryObj } from '@storybook/react';
import { BookCard } from './BookCard';
import { PlaceholderImage } from '../../_dev/PlaceholderImage';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/BookCard',
  component: BookCard,
  args: {
    title: 'Summer Ready Combo',
    details: 'Deep cleaning · 3 hours · 2 pros',
    price: '100',
    oldPrice: '399',
    image: <PlaceholderImage seed="book" />,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal booking row (Figma "Book Card"). Variants: Default, Small (48px image, no details), and With Professional (adds an avatar · name · rating row).',
      },
    },
  },
} satisfies Meta<typeof BookCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <VStack gap="sm">
      <BookCard
        title="Summer Ready Combo"
        details="Deep cleaning · 3 hours · 2 pros"
        price="100"
        oldPrice="399"
        image={<PlaceholderImage seed="combo" />}
      />
      <BookCard
        size="small"
        title="AC Filter Cleaning"
        price="100"
        oldPrice="399"
        image={<PlaceholderImage seed="ac" />}
      />
      <BookCard
        title="Home Deep Clean"
        details="Recommended for you"
        price="100"
        oldPrice="399"
        image={<PlaceholderImage seed="deep" />}
        professional={{ name: 'Leila', rating: '4.7', avatar: <PlaceholderImage seed="leila" /> }}
      />
    </VStack>
  ),
};
