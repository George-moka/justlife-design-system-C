import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ThemeProvider,
  useTheme,
  Text,
  Icon,
  VStack,
  BottomNavigation,
  HomeScreen,
  ProfileScreen,
  BookingsScreen,
  WalletAltScreen, // the alt composition under review — import WalletScreen instead to swap back

  OnboardingScreen,
  ToastProvider,
  type BottomNavItem,
} from '@justlife/ui';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { HomeCleaningFunnel } from './screens/HomeCleaningFunnel';
import { WomensSalonFunnel } from './screens/WomensSalonFunnel';
import { ThankYou } from './screens/ThankYou';

// Mock homepage for the Expo prototype — its real job is to host and test the BottomNavigation natively.
// Tapping a tab switches the screen; scrolling the feed shrinks the floating bar (the Instagram pattern).
// Everything is tokenised via useTheme(); the bar sits on the real OS home-indicator inset (no web hacks).

const TABS: BottomNavItem[] = [
  { key: 'home', label: 'Home', icon: 'house' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-check', badge: 2 },
  { key: 'lifeplus', label: 'life+', icon: 'activity' },
  { key: 'wallet', label: 'Wallet', icon: 'wallet' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

/** Simple placeholder for the non-home tabs, so tapping the navbar visibly switches screens. */
function PlaceholderContent({ title, icon }: { title: string; icon: string }) {
  const t = useTheme();
  return (
    <VStack gap="sm" align="center" style={{ paddingTop: t.size['96'] }}>
      <View style={{ width: t.size['72'], height: t.size['72'], borderRadius: t.radius.pill, backgroundColor: t.background.secondary, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size="xl" color={t.icon.secondary} />
      </View>
      <Text variant="titleMedium">{title}</Text>
      <Text variant="bodyBase" color="secondary" align="center">
        Mock screen — tap the tabs below to test the navigation bar.
      </Text>
    </VStack>
  );
}

function Root({ onOpenFunnel, onOpenSalon, onLogout }: { onOpenFunnel: () => void; onOpenSalon: () => void; onLogout: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('home');
  const [compact, setCompact] = useState(false);

  // Demo: simulate a fetch when the Bookings tab opens — skeleton ~1.8s, then the list. The FIRST load of
  // the session fails (so the ErrorState + Retry are reachable on device); Retry, and later opens, succeed.
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState(false);
  const bookingsFailedOnce = useRef(false);
  const loadBookings = useCallback(() => {
    setBookingsError(false);
    setBookingsLoading(true);
    return setTimeout(() => {
      setBookingsLoading(false);
      if (!bookingsFailedOnce.current) {
        bookingsFailedOnce.current = true;
        setBookingsError(true);
      }
    }, 1800);
  }, []);
  useEffect(() => {
    if (tab !== 'bookings') return;
    const id = loadBookings();
    return () => clearTimeout(id);
  }, [tab, loadBookings]);

  // Shrink the floating bar once the feed scrolls (Instagram pattern).
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setCompact(e.nativeEvent.contentOffset.y > t.size['12']);
  };

  // Room below the content so the last items clear the floating bar (bar height + its inset + breathing).
  const navClearance = t.size['56'] + insets.bottom + t.space.xl;
  const active = TABS.find((x) => x.key === tab)!;

  // The active tab's content — rendered WITHOUT its own bottom nav. A SINGLE persistent nav (below) serves
  // every tab, so its highlight pill SLIDES on every switch; a per-screen nav would remount on each switch and
  // the pill would jump. Bookings + Profile are the SAME shared screens Storybook renders (just `showNav={false}`).
  let content: React.ReactNode;
  if (tab === 'bookings') {
    content = (
      <BookingsScreen
        showNav={false}
        loading={bookingsLoading}
        error={bookingsError}
        onRetry={() => loadBookings()}
        safeAreaTop={insets.top}
        safeAreaBottom={insets.bottom}
        activeTab="bookings"
        onNavCompactChange={setCompact}
      />
    );
  } else if (tab === 'profile') {
    content = (
      <ProfileScreen showNav={false} name="Cem Mirkelam" phone="+971585235495" safeAreaTop={insets.top} safeAreaBottom={insets.bottom} activeTab="profile" onLogout={onLogout} onNavCompactChange={setCompact} />
    );
  } else if (tab === 'wallet') {
    content = (
      // The ALTERNATIVE Wallet composition (hero ledger) is under review — swap back to <WalletScreen …/> to compare.
      <WalletAltScreen showNav={false} safeAreaTop={insets.top} safeAreaBottom={insets.bottom} activeTab="wallet" onNavCompactChange={setCompact} />
    );
  } else if (tab === 'home') {
    content = (
      // The SHARED Home screen (Figma "Homepage → Full") — a PageShell that owns its OWN scroll, so it
      // is NOT wrapped in the prototype's ScrollView. `showNav={false}`: the app hoists one nav below.
      <HomeScreen
        showNav={false}
        safeAreaTop={insets.top}
        safeAreaBottom={insets.bottom}
        activeTab="home"
        onNavCompactChange={setCompact}
        onSelectService={(key) => (key.toLowerCase().includes('salon') ? onOpenSalon() : onOpenFunnel())}
        onRebook={onOpenFunnel}
      />
    );
  } else {
    content = (
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + t.space.md,
          paddingHorizontal: t.space.md,
          paddingBottom: navClearance,
        }}
      >
        <PlaceholderContent title={active.label} icon={active.icon} />
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.background.canvas }}>
      {content}
      {/* ONE persistent nav across all tabs → the pill slides on every switch (fixes the per-screen remount). */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
        <BottomNavigation
          items={TABS}
          activeKey={tab}
          // Reset to expanded when switching tabs — the new tab starts at the top and re-reports on scroll.
          onTabPress={(k) => {
            setCompact(false);
            setTab(k);
          }}
          // Every tab now shrinks on scroll: the home feed feeds `compact` from its own ScrollView; the
          // Bookings/Profile/Wallet screens feed it via `onNavCompactChange` (their PageShell `onScroll`).
          compact={compact}
          safeAreaInset={insets.bottom}
        />
      </View>
    </View>
  );
}

/** Top-level navigator: tabbed home → Home Cleaning funnel → Thank-You, each pushed over the last. */
function AppShell() {
  const insets = useSafeAreaInsets();
  const [route, setRoute] = useState<'home' | 'funnel' | 'salon' | 'thankyou' | 'onboarding'>('home');
  const content =
    route === 'funnel' ? (
      <HomeCleaningFunnel onBack={() => setRoute('home')} onComplete={() => setRoute('thankyou')} />
    ) : route === 'salon' ? (
      <WomensSalonFunnel onBack={() => setRoute('home')} onComplete={() => setRoute('thankyou')} />
    ) : route === 'thankyou' ? (
      <ThankYou leading="close" onLeadingPress={() => setRoute('home')} />
    ) : route === 'onboarding' ? (
      // Logout drops into the onboarding/OTP flow; any exit (finish, skip, or "I already have an
      // account") returns to the tabbed app. Full-screen with real safe-area insets, no bottom nav.
      <OnboardingScreen
        safeAreaTop={insets.top}
        safeAreaBottom={insets.bottom}
        onComplete={() => setRoute('home')}
        onSkip={() => setRoute('home')}
        onLogin={() => setRoute('home')}
      />
    ) : (
      <Root onOpenFunnel={() => setRoute('funnel')} onOpenSalon={() => setRoute('salon')} onLogout={() => setRoute('onboarding')} />
    );
  // Toasts appear at the top (the app has persistent bottom bars). The provider hosts the queue; fire via
  // useToast() from anywhere below (see ToastDemo on the home feed).
  return (
    <ToastProvider position="top" insets={{ top: insets.top, bottom: insets.bottom }}>
      {content}
    </ToastProvider>
  );
}

export default function App() {
  // Load Poppins under the exact face names `typographyToStyle` maps native weights to. Until they're
  // ready, render nothing (brief) so text never flashes in the system font.
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    // UAE dirham symbol font — the DS `Dirham` component renders with family 'aed' (AED_FONT_FAMILY).
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro's asset idiom
    aed: require('../../packages/ui/src/assets/fonts/aed-Regular.otf'),
  });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider themeName="light">
        <StatusBar style="dark" />
        <AppShell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
