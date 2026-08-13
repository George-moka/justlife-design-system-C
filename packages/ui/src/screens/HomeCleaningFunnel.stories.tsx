import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { HomeCleaningFunnelScreen, ThankYouScreen, useTheme } from '../index';
import { Phone } from '../_dev/PhoneFrame';

/**
 * The **Home Cleaning booking funnel** (5 steps, starting with Frequency). The screen itself is the SHARED,
 * frame-agnostic `HomeCleaningFunnelScreen` (in `screens/HomeCleaningFunnelScreen.tsx`) — the SAME composition
 * the Expo app renders natively, so web and native can't drift. Here it's wrapped in the web `Phone` frame and
 * given fixed web insets; pressing **"Complete"** routes to the `ThankYouScreen`.
 */
const meta = {
  title: 'Screens/Home Cleaning Funnel',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

/** Web host: the `Phone` frame + the shared funnel screen; Complete → Thank-You (loop-testable). */
function Flow({ initialStep }: { initialStep: number }) {
  const t = useTheme();
  const [done, setDone] = useState(false);
  // Complete → the shared Thank-You screen (in its own Phone frame); its X close loops back to the funnel.
  if (done)
    return (
      <Phone>
        <ThankYouScreen safeAreaTop={54} safeAreaBottom={t.safeArea.bottom} leading="close" onLeadingPress={() => setDone(false)} />
      </Phone>
    );
  return (
    <Phone>
      <HomeCleaningFunnelScreen
        initialStep={initialStep}
        safeAreaTop={69}
        safeAreaBottom={t.safeArea.bottom}
        onExit={() => {}}
        onComplete={() => setDone(true)}
      />
    </Phone>
  );
}

// Each story enters the flow at its own step; back/Next navigate through all five pages.
export const Step1Frequency: StoryObj = { name: '1 · Frequency', render: () => <Flow initialStep={1} /> };
export const Step2Service: StoryObj = { name: '2 · Home Cleaning', render: () => <Flow initialStep={2} /> };
export const Step3AddOns: StoryObj = { name: '3 · Popular Add-ons', render: () => <Flow initialStep={3} /> };
export const Step4DateTime: StoryObj = { name: '4 · Date & Time', render: () => <Flow initialStep={4} /> };
export const Step5Checkout: StoryObj = { name: '5 · Checkout', render: () => <Flow initialStep={5} /> };
