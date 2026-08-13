import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchBar } from './SearchBar';

const meta = {
  title: 'Core/SearchBar',
  component: SearchBar,
  args: {
    value: '',
    placeholder: 'Search',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Search bar (Figma "Search bar" → `Input/SearchMobile`). A pill text field: leading `search` icon, 11/14 text, and a circular clear button shown once there\'s a value. Focus swaps the surface + border from the `search.*` default tokens to their active variants. Controlled via `value` + `onChangeText`.',
      },
    },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Empty (placeholder) state.
export const Empty: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <SearchBar {...args} value={value} onChangeText={setValue} />;
  },
};

// Pre-filled — shows the clear button.
export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = useState('Deep cleaning');
    return <SearchBar {...args} value={value} onChangeText={setValue} />;
  },
};
