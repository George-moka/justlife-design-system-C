import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { PromiseList } from './PromiseList';

const ITEMS = [
  { title: 'More Days, More Savings!', desc: 'Save up to 40% based on your plan' },
  { title: 'Reschedule or Cancel Anytime', desc: 'Total flexibility at your fingertips!' },
];

const meta = {
  title: 'Components/PromiseList',
  component: PromiseList,
  parameters: {
    docs: {
      description: {
        component:
          'The funnel’s "justlife Promise": a quiet, centred reassurance block pressed tone-on-tone into the paper — a faint single-tone seal over a pale heading and centred title/description pairs in soft greys.',
      },
    },
  },
} satisfies Meta<typeof PromiseList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <View style={{ padding: 24 }}>
      <PromiseList items={ITEMS} title="justlife Promise" />
    </View>
  ),
};

/** Without a heading — just the faded seal over the reassurance points. */
export const WithoutHeading: Story = {
  render: () => (
    <View style={{ padding: 24 }}>
      <PromiseList items={ITEMS} />
    </View>
  ),
};
