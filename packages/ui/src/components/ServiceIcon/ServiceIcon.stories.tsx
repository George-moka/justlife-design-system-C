import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { ServiceIcon, SERVICE_NAMES } from './ServiceIcon';
import { Text } from '../../primitives/Text';
import { useTheme } from '../../theme/ThemeProvider';

const meta = {
  title: 'Core/ServiceIcon',
  component: ServiceIcon,
  parameters: {
    docs: {
      description: {
        component:
          'A 3D Justlife service icon, rendered by `name`. Pulled from the Figma service-icon set; transparent background, square, `contain`. Use for service pickers, promo stacks, and category headers.',
      },
    },
  },
} satisfies Meta<typeof ServiceIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { name: 'general-cleaning', size: 72 } };

/** The full service-icon catalog. */
export const Gallery: Story = {
  parameters: { mobileFrame: false, layout: 'padded' },
  render: () => {
    const t = useTheme();
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.md }}>
        {SERVICE_NAMES.map((n) => (
          <View key={n} style={{ width: 96, alignItems: 'center', gap: t.size['4'] }}>
            <ServiceIcon name={n} size={48} />
            <Text variant="bodyMicro" color="secondary" align="center">
              {n}
            </Text>
          </View>
        ))}
      </View>
    );
  },
};
