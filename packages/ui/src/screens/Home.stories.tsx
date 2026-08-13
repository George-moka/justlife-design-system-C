import type { Meta, StoryObj } from '@storybook/react';
import { HomeScreen, useTheme } from '../index';
import { Phone, SAFE_TOP } from '../_dev/PhoneFrame';

/**
 * The **Home** screen — built to the Figma `Homepage → Full` frame and its `Homepage Anatomy` spec
 * (address · sticky search · hero with live booking activity · notification · service icons ·
 * Book Again · banner areas · service tiles · 4-tab nav). The screen is the shared, frame-agnostic
 * `HomeScreen` (`screens/HomeScreen.tsx`) — the SAME composition the Expo app renders natively.
 *
 * The banner areas (Top offers · Top picks · promo) are **CRM images in the app**, so they render as
 * labelled image slots here rather than designed artwork.
 */
const meta = {
  title: 'Screens/Home',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

export const Default: StoryObj = {
  name: 'Home',
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <HomeScreen
          addressLabel="Home"
          eta="30 mins"
          safeAreaTop={SAFE_TOP}
          safeAreaBottom={t.safeArea.bottom}
        />
      </Phone>
    );
  },
};
