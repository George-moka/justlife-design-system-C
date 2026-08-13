import type { Meta, StoryObj } from '@storybook/react';
import { ActionRow } from './ActionRow';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/ActionRow',
  component: ActionRow,
  args: { icon: 'banknote', label: 'Pay Pending Amount', badge: '1', showChevron: true },
  argTypes: {
    badge: { control: 'text' },
    showChevron: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Action row (Figma "icon+text button") — a slim grey tappable row on a card surface: leading icon, label, optional count badge, trailing chevron. The canonical treatment for stacked secondary actions.',
      },
    },
  },
} satisfies Meta<typeof ActionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <VStack gap="sm">
      <ActionRow icon="banknote" label="Pay Pending Amount" badge="1" />
      <ActionRow icon="pencil" label="Edit this booking only" />
      <ActionRow icon="receipt" label="Show Receipt" />
      <ActionRow icon="circle-question-mark" label="No chevron" showChevron={false} />
    </VStack>
  ),
};
