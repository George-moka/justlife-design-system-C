import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Disclaimer } from './Disclaimer';

const meta = {
  title: 'Components/Disclaimer',
  component: Disclaimer,
  parameters: {
    docs: {
      description: {
        component:
          'A low-emphasis, neutral inline callout — leading icon, small text, optional trailing link. Grey on purpose (reference/reassurance copy, not a coloured alert). For a coloured notice use InfoCard.',
      },
    },
  },
} satisfies Meta<typeof Disclaimer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLink: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <Disclaimer action={{ label: 'Details', onPress: () => {} }}>
        Enjoy free cancellation up to 6 hours before your booking start time.
      </Disclaimer>
    </View>
  ),
};

export const TextOnly: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <Disclaimer icon="info">Prices include VAT. A service fee applies at checkout.</Disclaimer>
    </View>
  ),
};
