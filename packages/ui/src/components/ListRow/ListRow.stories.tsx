import type { Meta, StoryObj } from '@storybook/react';
import { ListRow } from './ListRow';
import { Card } from '../Card';

const meta = {
  title: 'Components/ListRow',
  component: ListRow,
  args: { icon: 'user', label: 'Profile', showChevron: true, divider: false, destructive: false },
  argTypes: {
    showChevron: { control: 'boolean' },
    divider: { control: 'boolean' },
    destructive: { control: 'boolean' },
    value: { control: 'text' },
    badge: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Clean settings/menu row (Figma "List item") — leading icon, label, optional trailing value / count badge / custom control, and a chevron. Stack inside a Card (divider on all but the last) to form a grouped menu. Distinct from ActionRow (the heavier grey block).',
      },
    },
  },
} satisfies Meta<typeof ListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Grouped: Story = {
  render: () => (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      <ListRow icon="user" label="Profile" divider onPress={() => {}} />
      <ListRow icon="heart" label="Favorites" divider onPress={() => {}} />
      <ListRow icon="credit-card" label="Payment Methods" value="Visa ··4242" divider onPress={() => {}} />
      <ListRow icon="bell" label="Notifications" badge={3} divider onPress={() => {}} />
      <ListRow icon="log-out" label="Log out" destructive showChevron={false} onPress={() => {}} />
    </Card>
  ),
};
