import React from 'react';
import { Pressable, View } from 'react-native';
import {
  useTheme,
  Text,
  VStack,
  Avatar,
  ListRow,
  Card,
  InfoCard,
  Icon,
  PageShell,
  ScreenAurora,
  BottomNavigation,
  type BottomNavItem,
} from '../index';
import { elevationToStyle } from '../theme/style-helpers';
import { useNavShrink } from '../lib/useNavShrink';

export interface ProfileScreenProps {
  /** Display name — initials feed the avatar, full name shows in the header band. */
  name?: string;
  /** Phone number shown under the name. */
  phone?: string;
  /** Status-bar / notch inset. */
  safeAreaTop?: number;
  /** Home-indicator inset (defaults to `safeArea.bottom`). */
  safeAreaBottom?: number;
  /** Active bottom-nav tab key (defaults to `profile`). */
  activeTab?: string;
  onTabPress?: (key: string) => void;
  /** Render the bottom nav + update notice (default `true`). The Expo app passes `false` and draws ONE
   *  persistent nav above all screens so the highlight pill slides across tab changes. */
  showNav?: boolean;
  /** A menu item was tapped (its `key`). */
  onSelectItem?: (key: string) => void;
  /** The "Update" banner action was tapped. */
  onUpdatePress?: () => void;
  /** The "Log out" action was tapped. */
  onLogout?: () => void;
  /** Forwards the nav "shrink on scroll" flag up — the Expo app's hoisted nav uses it (this screen renders no
   *  nav of its own there, so it reports `compact` instead of applying it). */
  onNavCompactChange?: (compact: boolean) => void;
}

interface MenuItem {
  key: string;
  icon: string;
  label: string;
}
interface MenuGroup {
  title: string;
  items: MenuItem[];
}

/**
 * Grouped account menu. Section titles (Account / Rewards / Support) are a redesign addition; every
 * row label is the verbatim copy from the current app.
 */
const GROUPS: MenuGroup[] = [
  {
    title: 'Account',
    items: [
      { key: 'profile', icon: 'user', label: 'Profile' },
      { key: 'favorites', icon: 'heart', label: 'Favorites' },
      { key: 'addresses', icon: 'map-pin', label: 'Addresses' },
      { key: 'payment', icon: 'credit-card', label: 'Payment Methods' },
    ],
  },
  {
    title: 'Rewards',
    items: [
      { key: 'referral', icon: 'users', label: 'Referral Credits' },
      { key: 'giftcard', icon: 'gift', label: 'Gift Card' },
    ],
  },
  {
    title: 'Support',
    items: [
      { key: 'help', icon: 'circle-question-mark', label: 'Get Help' },
      { key: 'settings', icon: 'settings', label: 'Settings' },
      { key: 'contact', icon: 'globe', label: 'Contact Us' },
    ],
  },
];

const NAV: BottomNavItem[] = [
  { key: 'home', label: 'Home', icon: 'house' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-check' },
  { key: 'lifeplus', label: 'life+', icon: 'activity' },
  { key: 'wallet', label: 'Wallet', icon: 'wallet' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

/**
 * **Profile / My Account screen** (shared, frame-agnostic). Built on the funnel's layered `PageShell`:
 * a tall brand **aurora band** that IS the profile hero — the **identity** (initials `Avatar` + name +
 * phone) centred over the aurora, no page title (the avatar + name carry it). A deeper `sheet` card
 * shadow lifts the rounded content card off the band; inside it are three labelled groups of `ListRow`s
 * on the recessed canvas, a subtle red "Log out", an "Update" `InfoCard` banner, and the floating
 * `BottomNavigation` (Profile active). Rendered by both Storybook (web `Phone` frame) and the Expo app.
 */
export function ProfileScreen({
  name = 'Cem Mirkelam',
  phone = '+971585235495',
  safeAreaTop = 0,
  safeAreaBottom,
  activeTab = 'profile',
  onTabPress,
  showNav = true,
  onSelectItem,
  onUpdatePress,
  onLogout,
  onNavCompactChange,
}: ProfileScreenProps) {
  const t = useTheme();
  const bottom = safeAreaBottom ?? t.safeArea.bottom;
  // Shrink the floating nav once the content scrolls (Instagram pattern) — same on every tab.
  const { compact: navCompact, onScroll: onNavScroll } = useNavShrink(onNavCompactChange);

  return (
    <PageShell
      pinned
      band={<ScreenAurora />}
      bandHeight={safeAreaTop + t.size['200']}
      // No page title — the band IS the hero: the identity centred over the aurora, below the status bar.
      // Bottom padding sets the breathing room between the phone number and the content card (~24px).
      bandContent={
        <View
          style={{
            flex: 1,
            paddingTop: safeAreaTop + t.space.md,
            paddingBottom: t.size['32'],
            paddingHorizontal: t.space.md,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Avatar name={name} size="lg" />
          <Text variant="titleMedium" numberOfLines={1} style={{ marginTop: t.space.sm }}>
            {name}
          </Text>
          <Text variant="bodyXSmall" color="secondary" style={{ marginTop: t.size['2'] }}>
            {phone}
          </Text>
        </View>
      }
      contentInsetTop={t.space.md}
      onScroll={onNavScroll}
      // No header bar — the band fills the status-bar area; renderHeader is just the (empty) required slot.
      renderHeader={() => null}
      // Soft upward shadow at the band ↔ card seam — lifts the card off the band. Wide blur + low
      // opacity for subtlety (a screen-local tune; promote to an elevation token if it spreads).
      cardShadow={{ color: 'rgba(26, 26, 26, 0.08)', offsetX: 0, offsetY: -2, blur: 24, spread: 0 }}
      footerInset={bottom + t.size['120']}
      footer={
        showNav ? (
          <>
            {/* "Update available" notice, pinned just above the nav. */}
            <View style={{ paddingHorizontal: t.space.md, marginBottom: t.space.sm }} pointerEvents="box-none">
              <InfoCard
                tone="accent"
                icon="refresh-cw"
                action={{ label: 'Update', onPress: () => onUpdatePress?.() }}
                style={elevationToStyle(t.elevation.raised)}
              >
                A fresh update is waiting for you! 🚀
              </InfoCard>
            </View>
            <BottomNavigation items={NAV} activeKey={activeTab} onTabPress={onTabPress} compact={navCompact} safeAreaInset={bottom} />
          </>
        ) : undefined
      }
    >
      {/* PageShell doesn't pad content horizontally — the page owns its side inset. */}
      <View style={{ paddingHorizontal: t.space.md }}>
        {/* Grouped menu — the identity (avatar/name/phone) lives in the header band above. */}
        <VStack gap="lg">
          {GROUPS.map((group) => (
            <VStack key={group.title} gap="sm">
              <Text variant="labelXSmall" color="secondary" style={{ marginLeft: t.space.xs }}>
                {group.title}
              </Text>
              <Card padded={false} style={{ overflow: 'hidden' }}>
                {group.items.map((item, i) => (
                  <ListRow
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    divider={i < group.items.length - 1}
                    onPress={() => onSelectItem?.(item.key)}
                  />
                ))}
              </Card>
            </VStack>
          ))}
        </VStack>

        {/* Subtle log out — red text, no card/surface. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={onLogout}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: t.space.xs,
            paddingVertical: t.space.lg,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Icon name="log-out" size="sm" color={t.text.error} />
          <Text variant="labelBase" style={{ color: t.text.error }}>
            Log out
          </Text>
        </Pressable>
      </View>
    </PageShell>
  );
}
