import type { Meta, StoryObj } from '@storybook/react';
import { CategoryCard } from './CategoryCard';
import { PlaceholderImage } from '../../_dev/PlaceholderImage';
import { HStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/CategoryCard',
  component: CategoryCard,
  args: { label: 'Summer Deals', image: <PlaceholderImage /> },
  argTypes: { onChange: { action: 'changed' } },
  parameters: {
    docs: {
      description: { component: 'Selectable category tile (Figma Category Card). Default / Selected states.' },
    },
  },
} satisfies Meta<typeof CategoryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <HStack gap="md" align="flex-start">
      <CategoryCard label="Cleaning" image={<PlaceholderImage seed="cleaning" />} />
      <CategoryCard label="Summer Deals" image={<PlaceholderImage seed="summer" />} defaultSelected />
      <CategoryCard label="Handyman services" image={<PlaceholderImage seed="handyman" />} />
    </HStack>
  ),
};
