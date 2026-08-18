import React from 'react';
const SAFE_TOP = 54;
import { HomeScreen } from '@justlife/ui/src/screens/HomeScreen';
import { HomeCleaningFunnelScreen } from '@justlife/ui/src/screens/HomeCleaningFunnelScreen';
import { WomensSalonFunnelScreen } from '@justlife/ui/src/screens/WomensSalonFunnelScreen';
import { ThankYouScreen } from '@justlife/ui/src/screens/ThankYouScreen';
import { ProfileScreen } from '@justlife/ui/src/screens/ProfileScreen';
import { BookingsScreen } from '@justlife/ui/src/screens/BookingsScreen';
import { OnboardingScreen } from '@justlife/ui/src/screens/OnboardingScreen';
import { WalletScreen } from '@justlife/ui/src/screens/WalletScreen';

const SAFE_BOTTOM = 34;
const noop = () => {};

export const SCREENS: Record<string, () => React.ReactElement> = {
  HomeScreen: () => (
    <HomeScreen addressLabel="Home" eta="30 mins" safeAreaTop={SAFE_TOP} safeAreaBottom={SAFE_BOTTOM} />
  ),
  WomensSalonFunnelScreen: () => (
    <WomensSalonFunnelScreen initialStep={1} safeAreaTop={69} safeAreaBottom={SAFE_BOTTOM} onExit={noop} onComplete={noop} />
  ),
  HomeCleaningFunnelScreen: () => (
    <HomeCleaningFunnelScreen initialStep={1} safeAreaTop={69} safeAreaBottom={SAFE_BOTTOM} onExit={noop} onComplete={noop} />
  ),
  ThankYouScreen: () => (
    <ThankYouScreen safeAreaTop={54} safeAreaBottom={SAFE_BOTTOM} leading="close" onLeadingPress={noop} />
  ),
  ProfileScreen: () => (<ProfileScreen safeAreaTop={SAFE_TOP} safeAreaBottom={SAFE_BOTTOM} />),
  BookingsScreen: () => (<BookingsScreen safeAreaTop={SAFE_TOP} safeAreaBottom={SAFE_BOTTOM} />),
  OnboardingScreen: () => (<OnboardingScreen safeAreaTop={SAFE_TOP} safeAreaBottom={SAFE_BOTTOM} />),
  WalletScreen: () => (<WalletScreen safeAreaTop={SAFE_TOP} safeAreaBottom={SAFE_BOTTOM} />),
};

const MATCH: [RegExp, string][] = [
  [/home ?cleaning|cleaning funnel|book cleaning/i, 'HomeCleaningFunnelScreen'],
  [/salon|spa|beauty/i, 'WomensSalonFunnelScreen'],
  [/thank ?you|confirmation|booking confirmed|success/i, 'ThankYouScreen'],
  [/profile|account|settings/i, 'ProfileScreen'],
  [/booking|my bookings|orders/i, 'BookingsScreen'],
  [/onboarding|welcome|intro/i, 'OnboardingScreen'],
  [/wallet|credit|balance/i, 'WalletScreen'],
  [/home ?screen|homepage|home page|^home$|landing/i, 'HomeScreen'],
];

export function matchScreen(prompt: string): string | null {
  for (const [re, name] of MATCH) if (re.test(prompt)) return name;
  return null;
}
