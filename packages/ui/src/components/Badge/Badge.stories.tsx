import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';
import { HStack } from '../../primitives/Stack';

const meta = {
  title: 'Core/Badge',
  component: Badge,
  args: { children: '5.0', tone: 'rating', icon: 'star', iconFilled: true },
  argTypes: {
    tone: { control: 'select', options: ['rating', 'success', 'neutral', 'brand', 'danger', 'warning'] },
  },
  parameters: {
    docs: {
      description: {
        component: 'Compact pill badge (Figma "Rating Tag" / badge). Tones map to the `badge` tokens; supports an optional leading icon.',
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <HStack gap="md" align="center" wrap>
      <Badge tone="rating" icon="star" iconFilled>
        5.0
      </Badge>
      <Badge tone="success">Save 33%</Badge>
      <Badge tone="neutral">New</Badge>
      <Badge tone="brand">Popular</Badge>
      <Badge tone="warning">Limited</Badge>
      <Badge tone="danger">Sold out</Badge>
    </HStack>
  ),
};
