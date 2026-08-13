import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingScreen, useTheme } from '../index';
import { Phone, SAFE_TOP } from '../_dev/PhoneFrame';

/**
 * Screen adaptation: the **Onboarding / OTP** flow, rebuilt from Figma to the DS. One self-contained,
 * clickable flow — **Welcome → Enter phone → Verify OTP** — rendered by BOTH Storybook (web `Phone`
 * frame) and the Expo app natively. Every visual value is a token; copy is verbatim from Figma.
 *
 * The signature moment is the **Justlife van** driving a dashed road while the OTP is "on the way", with a
 * `00:13` countdown that expires into **Resend via Whatsapp · SMS** and a "Sent via … ✓" confirmation.
 * Start on `Welcome` and click through, or jump straight to a step via the `initialStep` arg.
 */
const meta = {
  title: 'Screens/Onboarding',
  component: OnboardingScreen,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof OnboardingScreen>;

export default meta;
type Story = StoryObj<typeof OnboardingScreen>;

// Web host: fixed status-bar inset on top; the `Phone` frame supplies the device chrome.

const Framed = (initialStep: 'welcome' | 'phone' | 'verify') => () => {
  const t = useTheme();
  return (
    <Phone>
      <OnboardingScreen initialStep={initialStep} safeAreaTop={SAFE_TOP} safeAreaBottom={t.safeArea.bottom} />
    </Phone>
  );
};

/** The full flow — start here and click Get Started → Continue → Continue. */
export const Flow: Story = { name: 'Flow (start → finish)', render: Framed('welcome') };

export const Welcome: Story = { render: Framed('welcome') };
export const EnterPhone: Story = { name: 'Enter Phone', render: Framed('phone') };
export const VerifyOtp: Story = { name: 'Verify OTP', render: Framed('verify') };
