import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { HStack, VStack } from '../../primitives/Stack';

const meta = {
  title: 'Core/Button',
  component: Button,
  args: {
    children: 'Book now',
    variant: 'primary',
    size: 'md',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'tertiary', 'destructive', 'pill'],
    },
    size: { control: 'inline-radio', options: ['2xs', 'xs', 'sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    leftIcon: { control: 'select', options: [undefined, 'check', 'search', 'plus', 'arrow-right'] },
    rightIcon: { control: 'select', options: [undefined, 'chevron-right', 'arrow-right'] },
    onPress: { action: 'pressed' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Primary call-to-action control. Composes `Pressable` + `Text` + `Icon`, fully tokenised, with a built-in loading state and a ≥44px touch target.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <HStack gap="md" align="center" wrap>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="pill">Pill</Button>
    </HStack>
  ),
};

// `tone` recolours the label + icon by intent, keeping the variant's bg/border
// (e.g. a white pill with brand / danger text — used by ThankYouCard's action bar).
export const Tones: Story = {
  render: () => (
    <HStack gap="md" align="center" wrap>
      <Button variant="pill" tone="brand" leftIcon="calendar">
        Reschedule
      </Button>
      <Button variant="pill" tone="danger" leftIcon="x">
        Cancel
      </Button>
      <Button variant="pill" tone="neutral">
        Neutral
      </Button>
    </HStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack gap="md" align="center" wrap>
      <Button size="2xs">2XSmall</Button>
      <Button size="xs">XSmall</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </HStack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The compact `xs` size is for inline CTAs inside cards (e.g. Apply / Add Tip / Buy); it is sized by content rather than a 48px touch target.',
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <HStack gap="md" align="center" wrap>
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button loading accessibilityLabel="Loading">
        Loading
      </Button>
    </HStack>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <HStack gap="md" align="center" wrap>
      <Button leftIcon="plus">Add service</Button>
      <Button variant="secondary" rightIcon="chevron-right">
        Continue
      </Button>
      <Button variant="outline" leftIcon="search">
        Search
      </Button>
    </HStack>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <VStack gap="md" style={{ width: 320 }}>
      <Button fullWidth>Confirm booking</Button>
      <Button variant="secondary" fullWidth>
        Save for later
      </Button>
    </VStack>
  ),
};
