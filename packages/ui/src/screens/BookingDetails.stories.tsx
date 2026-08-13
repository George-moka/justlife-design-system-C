import type { Meta, StoryObj } from '@storybook/react';
import { ThankYouScreen, useTheme } from '../index';
import { Phone, SAFE_TOP } from '../_dev/PhoneFrame';

/**
 * The **Booking Details screen** — the SAME shared `ThankYouScreen` composition as the post-checkout
 * Thank-You, but opened from an existing booking, so its hero leading control is a **back arrow** (not the
 * Thank-You's `X` close). This is exactly what the `leading: 'close' | 'back'` prop is for: one screen, two
 * entry affordances, no duplicate code.
 */
const meta = {
  title: 'Screens/Booking Details',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;


/** Opened from an existing booking — the hero's leading control is a back arrow. */
export const Default: StoryObj = {
  name: 'Booking Details',
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <ThankYouScreen safeAreaTop={SAFE_TOP} safeAreaBottom={t.safeArea.bottom} leading="back" onLeadingPress={() => {}} />
      </Phone>
    );
  },
};
