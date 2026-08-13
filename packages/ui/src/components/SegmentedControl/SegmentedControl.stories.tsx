import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { SegmentedControl, type SegmentedControlOption } from './SegmentedControl';
import { ScreenAurora } from '../ScreenAurora';
import { VStack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { useTheme } from '../../theme/ThemeProvider';

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    docs: {
      description: {
        component:
          'Compact single-select toggle — a liquid-glass pill track with a brand pill on the selected segment. For 2–3 mutually-exclusive views in a header. (Glass refracts the content behind it; over flat paper it reads pale — these stories sit over an aurora backdrop.)',
      },
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Aurora backdrop so the glass has varied content to refract. */
function Backdrop({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ position: 'relative', padding: t.space.md, overflow: 'hidden', borderRadius: t.radius.lg }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}>
        <ScreenAurora />
      </View>
      {children}
    </View>
  );
}

function Demo({ options, initial }: { options: SegmentedControlOption[]; initial: string }) {
  const [value, setValue] = useState(initial);
  return <SegmentedControl options={options} value={value} onChange={setValue} />;
}

/** The Bookings header toggle. */
export const Playground: Story = {
  render: () => (
    <Backdrop>
      <Demo
        initial="upcoming"
        options={[
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' },
        ]}
      />
    </Backdrop>
  ),
};

/** Other 2–3-way uses across the app. */
export const Uses: Story = {
  render: () => {
    const t = useTheme();
    return (
      <Backdrop>
        <VStack gap="lg">
          <VStack gap="xs">
            <Text variant="labelXSmall" color="secondary">
              Wallet
            </Text>
            <Demo
              initial="transactions"
              options={[
                { key: 'transactions', label: 'Transactions' },
                { key: 'cashback', label: 'Cashback' },
              ]}
            />
          </VStack>
          <View style={{ height: t.borderWidth.hairline }} />
          <VStack gap="xs">
            <Text variant="labelXSmall" color="secondary">
              life+ (three segments)
            </Text>
            <Demo
              initial="plans"
              options={[
                { key: 'plans', label: 'Plans' },
                { key: 'benefits', label: 'Benefits' },
                { key: 'faq', label: 'FAQ' },
              ]}
            />
          </VStack>
        </VStack>
      </Backdrop>
    );
  },
};
