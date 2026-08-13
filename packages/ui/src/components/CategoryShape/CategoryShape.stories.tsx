import type { Meta, StoryObj } from '@storybook/react';
import { CategoryShape } from './CategoryShape';
import { HStack, VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';

const meta = {
  title: 'Core/CategoryShape',
  component: CategoryShape,
  args: { category: 'clean', size: 56 },
  parameters: {
    docs: {
      description: {
        component:
          'Brand shape per Justlife service vertical (Clean / Heal / Care / Assist). Used as the coloured background behind a professional photo. SVGs are extracted from apps/storybook/public via tools/figma-sync/gen-category-shapes.mjs.',
      },
    },
  },
} satisfies Meta<typeof CategoryShape>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Categories: Story = {
  render: () => (
    <HStack gap="lg" align="center">
      {(['clean', 'heal', 'care', 'assist'] as const).map((c) => (
        <VStack key={c} gap="xs" align="center">
          <CategoryShape category={c} size={56} />
          <Text variant="labelXSmall">{c}</Text>
        </VStack>
      ))}
    </HStack>
  ),
};
