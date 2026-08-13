import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { sampleIcons } from './icons';
import { Text } from '../../primitives/Text';
import { VStack } from '../../primitives/Stack';
import { View } from 'react-native';

const meta = {
  title: 'Core/Icon',
  component: Icon,
  args: { name: 'check', size: 'md' },
  argTypes: {
    name: { control: 'text', description: 'Any Lucide icon name (kebab-case) — see lucide.dev/icons' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
  },
  parameters: {
    docs: {
      description: {
        component: 'Icons from [Lucide](https://lucide.dev) — our icon library. Pass any Lucide name in kebab-case.',
      },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sample: Story = {
  name: 'Sample set',
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, maxWidth: 520 }}>
      {sampleIcons.map((name) => (
        <VStack key={name} gap="xs" align="center" style={{ width: 76 }}>
          <Icon name={name} size="lg" />
          <Text variant="bodyXSmall" color="secondary" align="center">
            {name}
          </Text>
        </VStack>
      ))}
    </View>
  ),
};
