import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TabGroup, type TabGroupItem } from './TabGroup';

// Real content from the Figma "Tab Group" (a booking-category picker).
const CATEGORIES: TabGroupItem[] = [
  { key: 'all', label: 'All Bookings', subtitle: 'You booked 99 times' },
  { key: 'cleaning', label: 'Home Cleaning', subtitle: 'You booked 18 times' },
  { key: 'salon', label: "Women's Salon", subtitle: 'You booked 13 times' },
];

const TITLES: TabGroupItem[] = CATEGORIES.map(({ key, label }) => ({ key, label }));

const meta = {
  title: 'Components/TabGroup',
  component: TabGroup,
  args: { items: CATEGORIES, activeKey: 'all', scrollable: true },
  argTypes: { onChange: { action: 'change' } },
  parameters: {
    docs: {
      description: {
        component:
          'Tab Group (Figma "Tab Group" / "Tab Item"). A row of equal-width card tabs, each with a title and an optional sub-line. The selected tab takes the brand border; others stay on the default hairline-grey border. Single-select, controlled via `activeKey` + `onChange`.',
      },
    },
  },
} satisfies Meta<typeof TabGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma slider: content-rich tabs at a fixed min-width; the row scrolls and peeks the next tab.
export const Slider: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [active, setActive] = useState('all');
    return <TabGroup scrollable items={CATEGORIES} activeKey={active} onChange={setActive} />;
  },
};

// Fill: equal-width tabs that flex to the container (for a few short tabs).
export const Fill: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [active, setActive] = useState('all');
    return <TabGroup items={TITLES} activeKey={active} onChange={setActive} />;
  },
};
