import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';
import { HStack } from '../../primitives/Stack';

const meta = {
  title: 'Core/StatusBadge',
  component: StatusBadge,
  args: { children: 'Active', tone: 'success' },
  parameters: {
    docs: {
      description: {
        component:
          'Tinted status pill (booking statuses, etc.). `tone` picks the tinted background + foreground; the `error` tone shows an alert icon by default. Shared by the booking cards.',
      },
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <HStack gap="sm" wrap>
      <StatusBadge tone="success">Active</StatusBadge>
      <StatusBadge tone="success">Professional Assigned</StatusBadge>
      <StatusBadge tone="info">Completed</StatusBadge>
      <StatusBadge tone="error">Cancelled</StatusBadge>
      <StatusBadge tone="warning">Pending</StatusBadge>
      <StatusBadge tone="neutral">Draft</StatusBadge>
    </HStack>
  ),
};
