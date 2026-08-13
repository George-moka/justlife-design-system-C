import type { Meta, StoryObj } from '@storybook/react';
import { ThankYouScreen, useTheme } from '../index';
import { Phone, SAFE_TOP } from '../_dev/PhoneFrame';

/**
 * Screen adaptation: the **post-checkout Thank-You screen** (Figma `aftercheckout-or-bookingdetails`). The
 * screen itself is the SHARED, frame-agnostic `ThankYouScreen` (in `screens/ThankYouScreen.tsx`) — the SAME
 * composition the Expo app renders natively, so web and native can't drift. Here it's wrapped in the web
 * `Phone` frame with fixed web insets.
 *
 * The **hero is a large media carousel** (image **or** video) that stays **fixed** while the page scrolls up
 * over it (web pins it with `position: sticky`); shown here as GREEN media slides with the real overlay
 * chrome. The rounded **content section sits over the hero**, the confirmation card **offset up over its top
 * edge**. All copy is the exact approved Figma content. The hero's leading control is an **X close** that
 * returns to the homepage. (The same `ThankYouScreen` reused for **Booking Details** passes `leading="back"` +
 * `confetti={false}` instead — see the **Booking Details** story below.)
 */
const meta = {
  title: 'Screens/Thank You',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

// Web host: the `Phone` frame + the shared screen, with fixed web insets (status-bar inset on top).

/** Post-checkout confirmation — the hero's leading control is an `X` that closes to the homepage; the arrival
 *  confetti celebrates the fresh booking. */
export const Confirmed: StoryObj = {
  name: 'Booking Confirmed',
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <ThankYouScreen safeAreaTop={SAFE_TOP} safeAreaBottom={t.safeArea.bottom} leading="close" onLeadingPress={() => {}} />
      </Phone>
    );
  },
};

/** Booking Details — the SAME screen reached by tapping an existing booking: a **back** chevron (returns to the
 *  list) and **no celebration confetti** (viewing a booking isn't a fresh confirmation). */
export const BookingDetails: StoryObj = {
  name: 'Booking Details',
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <ThankYouScreen
          safeAreaTop={SAFE_TOP}
          safeAreaBottom={t.safeArea.bottom}
          leading="back"
          confetti={false}
          onLeadingPress={() => {}}
        />
      </Phone>
    );
  },
};
