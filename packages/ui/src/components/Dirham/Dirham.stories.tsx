import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Dirham } from './Dirham';
import { Text } from '../../primitives/Text';
import { HStack, VStack } from '../../primitives/Stack';
import { useTheme } from '../../theme/ThemeProvider';

const meta = {
  title: 'Core/Dirham',
  component: Dirham,
  parameters: {
    docs: {
      description: {
        component:
          'The official UAE dirham currency symbol as text — a single-glyph font ("AED" renders as the symbol; graceful fallback to the letters if the font is missing). Size/colour it with the SAME variant as the amount it accompanies.',
      },
    },
  },
} satisfies Meta<typeof Dirham>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { variant: 'headlineSmall', color: 'primary' },
};

/** The symbol beside an amount, at the wallet's scales. */
export const WithAmounts: Story = {
  render: () => {
    const t = useTheme();
    return (
      <VStack gap="md" style={{ padding: t.space.md }}>
        <HStack gap="xs" align="center">
          <Dirham variant="headlineSmall" color="promoDark" />
          <Text variant="headlineSmall" color="promoDark">
            1000
          </Text>
        </HStack>
        <HStack gap="xs" align="center">
          <Dirham variant="titleMedium" />
          <Text variant="titleMedium">120</Text>
        </HStack>
        <HStack gap="xs" align="center">
          <Dirham variant="titleSmall" color="secondary" />
          <Text variant="titleSmall" color="secondary">
            250
          </Text>
        </HStack>
        {/* Fallback illustration: same composition WITHOUT the symbol font (plain Poppins). */}
        <View>
          <Text variant="bodyMicro" color="tertiary">
            fallback (font missing) renders as:
          </Text>
          <Text variant="titleMedium">AED 120</Text>
        </View>
      </VStack>
    );
  },
};
