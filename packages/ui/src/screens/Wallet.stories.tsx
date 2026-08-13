import type { Meta, StoryObj } from '@storybook/react';
import { WalletScreen, WalletAltScreen, useTheme, type BalanceSurface } from '../index';
import { Phone, SAFE_TOP } from '../_dev/PhoneFrame';

/**
 * Screen adaptation: the **Wallet** tab, built in the DS from the Figma `00.03_CreditsPage` (Figma is a
 * reference only — every size is a DS typography variant). The screen is the SHARED, frame-agnostic
 * `WalletScreen` (in `screens/WalletScreen.tsx`) — the SAME composition the Expo app renders natively.
 *
 * A soft brand **aurora** header ("Wallet" + two balance cards), then the **Credit Packages** carousel and
 * a **Justlife Gift Card** banner. **Static** — one plain scroll, no collapse animation. Floating
 * `BottomNavigation` (Wallet active).
 */
const meta = {
  title: 'Screens/Wallet',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;


function WalletWith(variant: BalanceSurface): StoryObj {
  return {
    render: () => {
      const t = useTheme();
      return (
        <Phone>
          <WalletScreen safeAreaTop={SAFE_TOP} safeAreaBottom={t.safeArea.bottom} balanceVariant={variant} />
        </Phone>
      );
    },
  };
}

/** Current treatment — liquid glass (renders flat here; real glass only on a physical iOS 26 device). */
export const Default: StoryObj = WalletWith('glass');

// ── Balance-card surface options under review (full page, in context). All render truthfully here. ──
/** A · White cards + soft shadow — crisp, float off the band, highest contrast. */
export const OptionA_White: StoryObj = WalletWith('white');
/** B · Brand-tint fill + hairline brand border — on-brand and "special", still legible. */
export const OptionB_Tint: StoryObj = WalletWith('tint');
/** C · Flat white, borderless — minimal/airy, lowest separation from the band. */
export const OptionC_Flat: StoryObj = WalletWith('flat');

/**
 * **Alternative composition (WIP)** — the "hero ledger": ONE focal credit balance centred on the aurora,
 * Available Promotions as a slim 3D-icon ledger row, the approved package carousel + gift banner reused
 * untouched — and the whole page fits with NO vertical scroll.
 */
export const Alternative: StoryObj = {
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <WalletAltScreen safeAreaTop={SAFE_TOP} safeAreaBottom={t.safeArea.bottom} />
      </Phone>
    );
  },
};

