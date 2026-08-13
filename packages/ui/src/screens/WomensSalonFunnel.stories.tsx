import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { WomensSalonFunnelScreen, ThankYouScreen, useTheme } from '../index';
import { Phone } from '../_dev/PhoneFrame';

/**
 * The **Women's Salon booking funnel** (4 steps) — the first **flex funnel**: step 1 is a collapsing
 * video-hero page (category chips pin under the header on scroll); steps 2–4 reuse the pinned aurora
 * funnel shell. The screen is the SHARED, frame-agnostic `WomensSalonFunnelScreen`
 * (`screens/WomensSalonFunnelScreen.tsx`); content is verbatim from the live justlife.com flex funnel +
 * the old-app screenshots, with GREEN placeholders where real content isn't captured yet.
 * Pressing **"Complete"** routes to the shared `ThankYouScreen`.
 */
const meta = {
  title: "Screens/Women's Salon Funnel",
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

/** Web host: `Phone` frame + the shared funnel screen; Complete → Thank-You (loop-testable). */
function Flow({ initialStep }: { initialStep: number }) {
  const t = useTheme();
  const [done, setDone] = useState(false);
  if (done)
    return (
      <Phone>
        <ThankYouScreen safeAreaTop={54} safeAreaBottom={t.safeArea.bottom} leading="close" onLeadingPress={() => setDone(false)} />
      </Phone>
    );
  return (
    <Phone>
      <WomensSalonFunnelScreen
        initialStep={initialStep}
        safeAreaTop={69}
        safeAreaBottom={t.safeArea.bottom}
        onExit={() => {}}
        onComplete={() => setDone(true)}
      />
    </Phone>
  );
}

// Each story enters the flow at its own step; back/Next navigate through all four pages.
export const Step1Services: StoryObj = { name: "1 · Women's Salon", render: () => <Flow initialStep={1} /> };
export const Step2AddOns: StoryObj = { name: '2 · Popular Add-ons', render: () => <Flow initialStep={2} /> };
export const Step3DateTime: StoryObj = { name: '3 · Date & Time', render: () => <Flow initialStep={3} /> };
export const Step4Checkout: StoryObj = { name: '4 · Checkout', render: () => <Flow initialStep={4} /> };
