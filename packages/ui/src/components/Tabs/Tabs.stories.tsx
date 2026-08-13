import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Tabs } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          'Underline section tabs (e.g. Upcoming / Past) — equal-width text tabs on a hairline baseline, the active one brand-coloured with a brand underline. Distinct from TabGroup (card tabs) and PillGroup (segmented pills).',
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState('upcoming');
    return (
      <View style={{ padding: 16 }}>
        <Tabs
          items={[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' },
          ]}
          activeKey={active}
          onChange={setActive}
        />
      </View>
    );
  },
};

/** Three tabs flex to equal widths. */
export const ThreeTabs: Story = {
  render: () => {
    const [active, setActive] = useState('all');
    return (
      <View style={{ padding: 16 }}>
        <Tabs
          items={[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'done', label: 'Done' },
          ]}
          activeKey={active}
          onChange={setActive}
        />
      </View>
    );
  },
};
