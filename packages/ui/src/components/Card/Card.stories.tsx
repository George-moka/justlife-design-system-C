import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Text } from '../../primitives/Text';
import { Button } from '../Button/Button';
import { VStack, HStack } from '../../primitives/Stack';

const meta = {
  title: 'Core/Card',
  component: Card,
  args: { elevation: 'raised', padded: true, bordered: false },
  argTypes: {
    elevation: { control: 'select', options: ['none', 'raised', 'overlay', 'sheet'] },
    padded: { control: 'boolean' },
    bordered: { control: 'boolean' },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Card {...args} style={{ width: 320 }}>
      <VStack gap="sm">
        <Text variant="titleLarge">Premium Home Cleaning</Text>
        <Text color="secondary">A sparkling home, handled by vetted professionals.</Text>
      </VStack>
    </Card>
  ),
};

export const ServiceCardExample: Story = {
  name: 'Composed: service card',
  render: () => (
    <Card style={{ width: 320 }}>
      <VStack gap="md">
        <VStack gap="xs">
          <Text variant="titleLarge">Deep Cleaning</Text>
          <Text color="secondary">3 hours · 2 professionals</Text>
        </VStack>
        <HStack justify="space-between" align="center">
          <Text variant="headlineSmall" color="link">
            AED 189
          </Text>
          <Button rightIcon="chevron-right">Book</Button>
        </HStack>
      </VStack>
    </Card>
  ),
};
