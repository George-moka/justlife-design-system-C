import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { ScreenAurora } from './ScreenAurora';

const meta = {
  title: 'Components/ScreenAurora',
  component: ScreenAurora,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The soft brand "aurora" band behind layered screen headers (funnel steps, Profile hero): a paper base with two diffuse brand glows. Drop into PageShell’s `band` slot. Composes the RadialGlow primitive.',
      },
    },
  },
} satisfies Meta<typeof ScreenAurora>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <View style={{ height: 240 }}>
      <ScreenAurora />
    </View>
  ),
};
