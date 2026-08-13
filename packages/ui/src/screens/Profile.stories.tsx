import type { Meta, StoryObj } from '@storybook/react';
import { ProfileScreen, useTheme } from '../index';
import { Phone, SAFE_TOP } from '../_dev/PhoneFrame';

/**
 * Screen adaptation: the **Profile / My Account** page, redesigned in the DS. The screen itself is the
 * SHARED, frame-agnostic `ProfileScreen` (in `screens/ProfileScreen.tsx`) — the SAME composition the
 * Expo app renders natively, so web and native can't drift. Here it's wrapped in the web `Phone` frame.
 *
 * A tappable identity card (initials `Avatar` + name + phone) sits above three labelled groups of
 * `ListRow`s in white cards on the recessed canvas, then an "Update" `InfoCard` banner, with the
 * floating `BottomNavigation` (Profile active). No confetti, no profile photo — initials only.
 */
const meta = {
  title: 'Screens/Profile',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

// Web host: the `Phone` frame + the shared screen, with a fixed web status-bar inset on top.

export const MyAccount: StoryObj = {
  name: 'My Account',
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <ProfileScreen
          name="Cem Mirkelam"
          phone="+971585235495"
          safeAreaTop={SAFE_TOP}
          safeAreaBottom={t.safeArea.bottom}
        />
      </Phone>
    );
  },
};
