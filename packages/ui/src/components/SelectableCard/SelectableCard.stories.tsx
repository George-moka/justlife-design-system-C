import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SelectableCard } from './SelectableCard';
import { Text } from '../../primitives/Text';
import { VStack } from '../../primitives/Stack';
import { Radio } from '../Radio';
import { View } from 'react-native';

const meta = {
  title: 'Core/SelectableCard',
  component: SelectableCard,
  parameters: {
    docs: {
      description: {
        component:
          'Shared shell for selectable list rows (Figma "Selectable Item"). Owns the container, selected background + brand border, press behaviour and the row layout. Domain cards (AddressCard, PaymentMethodCard) compose it and supply their own content + trailing controls.',
      },
    },
  },
} satisfies Meta<typeof SelectableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// The shell on its own — supply any content + a trailing control.
export const Playground: Story = {
  render: function Shell() {
    const [chosen, setChosen] = useState(0);
    return (
      <VStack gap="sm">
        {['First option', 'Second option', 'Third option'].map((label, i) => (
          <SelectableCard
            key={label}
            selected={chosen === i}
            onPress={() => setChosen(i)}
            accessibilityLabel={label}
          >
            <Text variant="labelXSmall" style={{ flex: 1 }}>
              {label}
            </Text>
            <View pointerEvents="none">
              <Radio selected={chosen === i} accessibilityLabel={label} />
            </View>
          </SelectableCard>
        ))}
      </VStack>
    );
  },
};
