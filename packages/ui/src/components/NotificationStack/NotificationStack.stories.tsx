import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';
import { NotificationStack, type NotificationItem } from './NotificationStack';
import { useTheme } from '../../theme/ThemeProvider';

/** The worst case, already ranked: what breaks if ignored first, glanceable news last. */
const NOTICES: NotificationItem[] = [
  {
    key: 'payment',
    tone: 'danger',
    icon: 'triangle-alert',
    message: 'Update payment to renew your',
    emphasis: 'Cleaning Subscription.',
    onPress: () => {},
  },
  {
    key: 'booking-action',
    tone: 'warning',
    icon: 'bell',
    message: 'You need to take action',
    emphasis: 'related to your booking.',
    onPress: () => {},
  },
  {
    key: 'tomorrow',
    tone: 'neutral',
    icon: 'calendar-check',
    emphasisFirst: true,
    emphasis: 'Juniper will serve you tomorrow.',
    message: 'Home Cleaning, 08:00 - 08:30',
    onPress: () => {},
    onDismiss: () => {},
  },
  {
    key: 'weather',
    tone: 'neutral',
    icon: 'cloud-rain',
    message: 'Due to poor weather conditions,',
    emphasis: 'bookings may be delayed or rescheduled.',
  },
  {
    key: 'message',
    tone: 'neutral',
    icon: 'message-circle',
    unread: true,
    message: 'New message from',
    emphasis: 'Ahmed Mohammed Joseph',
    onPress: () => {},
    onDismiss: () => {},
  },
];

function Page({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ backgroundColor: t.background.canvas, padding: t.space.md }}>{children}</View>;
}

const meta = {
  title: 'Components/NotificationStack',
  component: NotificationStack,
  parameters: {
    docs: {
      description: {
        component:
          'A deck of notifications: one live banner on top, the rest as tinted peek slivers behind it, and a quiet "N more" toggle. Home\'s height stops depending on how many notifications exist, and the notice the user must act on is never buried — as long as `items` arrive ranked.',
      },
    },
  },
} satisfies Meta<typeof NotificationStack>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The worst case — five notices collapsed into one deck. Tap the slivers or "4 more" to expand. */
export const Collapsed: Story = {
  args: { items: NOTICES },
  render: (args) => (
    <Page>
      <NotificationStack {...args} />
    </Page>
  ),
};

/** Expanded — every notice in priority order, each with its own trailing affordance. */
export const Expanded: Story = {
  args: { items: NOTICES, expanded: true },
  render: (args) => (
    <Page>
      <NotificationStack {...args} />
    </Page>
  ),
};

/** Two notices — one sliver behind the top card. */
export const TwoNotices: Story = {
  args: { items: NOTICES.slice(0, 2) },
  render: (args) => (
    <Page>
      <NotificationStack {...args} />
    </Page>
  ),
};

/** A single notice is just a banner — no deck, no toggle, nothing to expand. */
export const SingleNotice: Story = {
  args: { items: NOTICES.slice(0, 1) },
  render: (args) => (
    <Page>
      <NotificationStack {...args} />
    </Page>
  ),
};

/** Dismissing really removes the notice — the deck restacks and the count follows it down. */
export const Dismissable: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [items, setItems] = useState(NOTICES);
    const withDismiss = items.map((n) =>
      n.onDismiss ? { ...n, onDismiss: () => setItems((cur) => cur.filter((c) => c.key !== n.key)) } : n,
    );
    return (
      <Page>
        <NotificationStack items={withDismiss} />
      </Page>
    );
  },
};
