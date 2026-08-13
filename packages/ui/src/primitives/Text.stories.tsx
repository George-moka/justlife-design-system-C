import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';
import { VStack } from './Stack';

const meta = {
  title: 'Primitives/Text',
  component: Text,
  args: { variant: 'bodyMedium', color: 'primary', children: 'The quick brown fox jumps over the lazy dog' },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'displayMedium',
        'headlineXLarge',
        'headlineLarge',
        'headlineMedium',
        'headlineSmall',
        'titleLarge',
        'titleMedium',
        'titleSmall',
        'bodyLarge',
        'bodyMedium',
        'bodyBase',
        'bodyXSmall',
        'bodyMicro',
        'labelLarge',
        'labelMedium',
        'labelBase',
        'labelXSmall',
        'labelXXSmall',
      ],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'inverse', 'disabled', 'link'],
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants = [
  'displayMedium',
  'headlineXLarge',
  'headlineLarge',
  'headlineMedium',
  'headlineSmall',
  'titleLarge',
  'titleMedium',
  'titleSmall',
  'bodyLarge',
  'bodyMedium',
  'bodyBase',
  'bodyXSmall',
  'bodyMicro',
  'labelLarge',
  'labelMedium',
  'labelBase',
  'labelXSmall',
  'labelXXSmall',
] as const;

export const Playground: Story = {};

export const TypeScale: Story = {
  render: () => (
    <VStack gap="md">
      {variants.map((v) => (
        <Text key={v} variant={v}>
          {v} — Justlife Design System
        </Text>
      ))}
    </VStack>
  ),
};
