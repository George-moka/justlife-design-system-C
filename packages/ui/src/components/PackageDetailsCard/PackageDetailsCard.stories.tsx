import type { Meta, StoryObj } from '@storybook/react';
import { PackageDetailsCard } from './PackageDetailsCard';
import { VStack } from '../../primitives/Stack';

const meta = {
  title: 'Components/PackageDetailsCard',
  component: PackageDetailsCard,
  args: {
    title: 'Package Details',
    description: '90 mins Massage Package (4 sessions)',
    remaining: '2 of 4 sessions left',
    state: 'active',
  },
  argTypes: { onPress: { action: 'pressed' } },
  parameters: {
    docs: {
      description: {
        component:
          'Package summary row (Figma "Package Details Card"). Title + description, an optional "remaining" pill (reuses StatusBadge `info` tone), and a disclosure chevron. `expired` renders the title in error red and hides the remaining pill.',
      },
    },
  },
} satisfies Meta<typeof PackageDetailsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = { args: { onPress: () => {} } };

export const Expired: Story = {
  args: {
    title: 'Package Expired',
    description: '90 mins Massage Package (4 sessions)',
    state: 'expired',
    onPress: () => {},
  },
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <VStack gap="sm">
      <PackageDetailsCard
        title="Package Details"
        description="90 mins Massage Package (4 sessions)"
        remaining="2 of 4 sessions left"
        onPress={() => {}}
      />
      <PackageDetailsCard
        title="Cleaning Bundle"
        description="2 hrs Deep Cleaning (8 sessions)"
        remaining="8 of 8 sessions left"
        onPress={() => {}}
      />
      <PackageDetailsCard
        title="Package Expired"
        description="90 mins Massage Package (4 sessions)"
        state="expired"
        onPress={() => {}}
      />
    </VStack>
  ),
};
