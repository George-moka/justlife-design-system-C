import type { Meta, StoryObj } from '@storybook/react';
import { BookingsScreen, useTheme } from '../index';
import { Phone, SAFE_TOP } from '../_dev/PhoneFrame';

/**
 * Screen adaptation: the **Bookings** tab, rebuilt in the DS. The screen is the SHARED, frame-agnostic
 * `BookingsScreen` (in `screens/BookingsScreen.tsx`) — the SAME composition the Expo app renders natively.
 *
 * A "Bookings" title + a glass segmented control (Upcoming / Past) in the header, a swipeable carousel of
 * `PlanBookingCard`s for the active segment (with empty states), and the floating `BottomNavigation`.
 */
const meta = {
  title: 'Screens/Bookings',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;


export const Upcoming: StoryObj = {
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <BookingsScreen safeAreaTop={SAFE_TOP} safeAreaBottom={t.safeArea.bottom} initialSegment="upcoming" />
      </Phone>
    );
  },
};

export const Past: StoryObj = {
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <BookingsScreen safeAreaTop={SAFE_TOP} safeAreaBottom={t.safeArea.bottom} initialSegment="past" />
      </Phone>
    );
  },
};

/** Loading — card skeletons (shimmer wave) while bookings are being fetched; the header chrome stays. */
export const Loading: StoryObj = {
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <BookingsScreen safeAreaTop={SAFE_TOP} safeAreaBottom={t.safeArea.bottom} loading />
      </Phone>
    );
  },
};

/** Error — the fetch failed; the content area shows `ErrorState` with a Retry action (header chrome stays). */
export const LoadError: StoryObj = {
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <BookingsScreen safeAreaTop={SAFE_TOP} safeAreaBottom={t.safeArea.bottom} error onRetry={() => {}} />
      </Phone>
    );
  },
};

/** Empty state — a segment with no bookings (muted icon + centred ghost text). */
export const Empty: StoryObj = {
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <BookingsScreen safeAreaTop={SAFE_TOP} safeAreaBottom={t.safeArea.bottom} initialSegment="upcoming" upcoming={[]} />
      </Phone>
    );
  },
};
