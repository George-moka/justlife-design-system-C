import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { NotificationBanner } from './NotificationBanner';
import { useTheme } from '../../theme/ThemeProvider';
import { PaymentLogo } from '../PaymentMethodCard';

/** The Tabby lockup — the DS payment logo stands in for the leading icon. */
const TabbyChip = () => <PaymentLogo name="tabby" label="Tabby" />;

const meta = {
  title: 'Components/NotificationBanner',
  component: NotificationBanner,
  parameters: {
    docs: {
      description: {
        component:
          'The tinted strip Home shows between the hero and the feed. One notice, one trailing affordance: a close button when it is dismissible, a chevron when tapping it takes you somewhere, nothing when it is a passive advisory.',
      },
    },
  },
} satisfies Meta<typeof NotificationBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Action required — a failed payment. Not dismissible: it stays until the user resolves it. */
export const Danger: Story = {
  args: {
    tone: 'danger',
    icon: 'triangle-alert',
    message: 'Update payment to renew your',
    emphasis: 'Cleaning Subscription.',
    onPress: () => {},
  },
};

/** A booking changed under the user — amber, tappable, not dismissible. */
export const ProfessionalChanged: Story = {
  args: {
    tone: 'warning',
    icon: 'refresh-cw',
    message: 'We are sorry to inform that,',
    emphasis: 'your professional has changed.',
    onPress: () => {},
  },
};

/** Something needs the user's input on a booking. */
export const TakeAction: Story = {
  args: {
    tone: 'warning',
    icon: 'bell',
    message: 'You need to take action',
    emphasis: 'related to your booking.',
    onPress: () => {},
  },
};

/** A payment provider lockup replaces the icon via `leading`. */
export const WithLogo: Story = {
  args: {
    tone: 'warning',
    leading: <TabbyChip />,
    message: 'Please complete your payment with Tabby',
    emphasis: 'to renew your Cleaning Subscription.',
    onPress: () => {},
  },
};

/** A chat message — neutral tint, unread dot on the icon, dismissible. */
export const NewMessage: Story = {
  args: {
    tone: 'neutral',
    icon: 'message-circle',
    unread: true,
    message: 'New message from',
    emphasis: 'Ahmed Mohammed Joseph',
    onPress: () => {},
    onDismiss: () => {},
  },
};

/** A service-wide advisory — passive, so it carries no trailing affordance at all. */
export const Advisory: Story = {
  args: {
    tone: 'neutral',
    icon: 'cloud-rain',
    message: 'Due to poor weather conditions,',
    emphasis: 'bookings may be delayed or rescheduled.',
  },
};

/** Tomorrow's booking — the emphasis leads and the detail follows. */
export const UpcomingBooking: Story = {
  args: {
    tone: 'neutral',
    icon: 'calendar-check',
    emphasisFirst: true,
    emphasis: 'Juniper will serve you tomorrow.',
    message: 'Home Cleaning, 08:00 - 08:30',
    onPress: () => {},
    onDismiss: () => {},
  },
};

/** An offer — the brand tint, kept for friendly nudges rather than status. */
export const Offer: Story = {
  args: {
    tone: 'brand',
    icon: 'bell',
    message: 'Select a new timing',
    emphasis: 'and enjoy AED 30 off!',
    onPress: () => {},
    onDismiss: () => {},
  },
};

/** Every variant in the Figma set, in one column — the tones and heights read as one family. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const t = useTheme();
    return (
      // No side padding — the frame already supplies the page gutter, so the banners render at their
      // real 343pt content width and wrap exactly as they do on Home.
      <View style={{ gap: t.space.sm, paddingVertical: t.space.md, backgroundColor: t.background.canvas }}>
        <NotificationBanner tone="danger" icon="triangle-alert" message="Update payment to renew your" emphasis="Cleaning Subscription." onPress={() => {}} />
        <NotificationBanner tone="warning" icon="refresh-cw" message="We are sorry to inform that," emphasis="your professional has changed." onPress={() => {}} />
        <NotificationBanner tone="warning" icon="bell" message="You need to take action" emphasis="related to your booking." onPress={() => {}} />
        <NotificationBanner tone="warning" leading={<TabbyChip />} message="Please complete your payment with Tabby" emphasis="to renew your Cleaning Subscription." onPress={() => {}} />
        <NotificationBanner tone="neutral" icon="message-circle" unread message="New message from" emphasis="Ahmed Mohammed Joseph" onPress={() => {}} onDismiss={() => {}} />
        <NotificationBanner tone="neutral" icon="cloud-rain" message="Due to poor weather conditions," emphasis="bookings may be delayed or rescheduled." />
        <NotificationBanner tone="neutral" icon="calendar-check" emphasisFirst emphasis="Juniper will serve you tomorrow." message="Home Cleaning, 08:00 - 08:30" onPress={() => {}} onDismiss={() => {}} />
        <NotificationBanner tone="brand" icon="bell" message="Select a new timing" emphasis="and enjoy AED 30 off!" onPress={() => {}} onDismiss={() => {}} />
      </View>
    );
  },
};
