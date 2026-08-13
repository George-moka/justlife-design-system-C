import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import giftCard from '../assets/gift_card.png';
import {
  useTheme,
  Text,
  HStack,
  VStack,
  Icon,
  Button,
  Badge,
  Card,
  ScreenAurora,
  GlassSurface,
  PageShell,
  BottomNavigation,
  ServiceIcon,
  Dirham,
  type ServiceName,
  type BottomNavItem,
} from '../index';
import type { Tokens } from '@justlife/tokens';
import type { StringKeyOf } from '../theme/style-helpers';
import { useNavShrink } from '../lib/useNavShrink';
import { elevationToStyle } from '../theme/style-helpers';

/** Surface treatment for the two balance cards — `glass` (current) vs three non-glass options under review. */
export type BalanceSurface = 'glass' | 'white' | 'tint' | 'flat';

// ── Tab bar (shared with the other tab roots — 5 tabs; Wallet active here). ──
export const NAV: BottomNavItem[] = [
  { key: 'home', label: 'Home', icon: 'house' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-check' },
  { key: 'lifeplus', label: 'life+', icon: 'activity' },
  { key: 'wallet', label: 'Wallet', icon: 'wallet' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

export type CreditPackageTier = 'basic' | 'smart' | 'super';

export interface WalletPackage {
  /** Tier name shown at the top, e.g. "BASIC". */
  tier: string;
  /** Drives the card's tint (DS `creditPackage` tokens). */
  tone: CreditPackageTier;
  /** Savings pill, e.g. "Save 35%". */
  save: string;
  /** Amount the customer pays. */
  pay: string;
  /** Credit the customer gets. */
  get: string;
  /** Validity note, e.g. "60 day validity.". */
  validity: string;
  /** Highlights the card with the "Most Popular" chip. */
  popular?: boolean;
}

export interface WalletScreenProps {
  /** Status-bar / notch inset. */
  safeAreaTop?: number;
  /** Home-indicator inset (defaults to `safeArea.bottom`). */
  safeAreaBottom?: number;
  /** Active bottom-nav tab key (defaults to `wallet`). */
  activeTab?: string;
  onTabPress?: (key: string) => void;
  /** Render the bottom nav (default `true`). The Expo app passes `false` and draws ONE persistent nav. */
  showNav?: boolean;
  /** Justlife Credit balance (currency included), default "AED 250". */
  creditAmount?: string;
  /** Available Promotions balance, default "AED 120". */
  promoAmount?: string;
  /** Number of extra promo services beyond the shown avatars (the "+N"). */
  promoExtra?: number;
  /** Credit packages for the carousel. */
  packages?: WalletPackage[];
  onSeeActivity?: () => void;
  onPressCredit?: () => void;
  onPressPromotions?: () => void;
  onViewAllPackages?: () => void;
  onTopUp?: (tier: string) => void;
  onSendGift?: () => void;
  /** Forwards the nav "shrink on scroll" flag up — the Expo app's hoisted nav uses it (this screen renders no
   *  nav of its own there, so it reports `compact` instead of applying it). */
  onNavCompactChange?: (compact: boolean) => void;
  /** Surface treatment for the two balance cards (under review — see `BalanceSurface`). Default `glass`. */
  balanceVariant?: BalanceSurface;
}

export const DEFAULT_PACKAGES: WalletPackage[] = [
  { tier: 'BASIC', tone: 'basic', save: 'Save 35%', pay: '250', get: '375', validity: '60 day validity.' },
  { tier: 'SMART', tone: 'smart', save: 'Save 50%', pay: '500', get: '1000', validity: '120 day validity.', popular: true },
  { tier: 'SUPER', tone: 'super', save: 'Save 50%', pay: '999', get: '2000', validity: '180 day validity.' },
];

export const GIFT_COPY =
  'A spa day at home or a chores-free day? Send a Justlife gift card to treat your loved one to their favorite home service.';

/** Splits "AED 250" → currency + value (no space → it's all value). */
export function splitAmount(amount: string): { currency: string | null; value: string } {
  const i = amount.indexOf(' ');
  return i > 0 ? { currency: amount.slice(0, i), value: amount.slice(i + 1) } : { currency: null, value: amount };
}

/** A money value: the AED unit renders as the official dirham SYMBOL (DS `Dirham`, same variant/colour as
 *  the digits so they read as one unit); any other unit stays text. Wallet-local for now — promote with the
 *  rest of the Wallet helpers at bake time. */
export function Amount({
  amount,
  variant = 'titleMedium',
  color = 'primary',
}: {
  amount: string;
  variant?: keyof Tokens['typography'];
  color?: StringKeyOf<Tokens['text']>;
}) {
  const { currency, value } = splitAmount(amount);
  return (
    // `gap="none"` — the dirham symbol hugs its digits (they're one money token); HStack's default
    // gap is 8, which read as a stray space between the glyph and the number.
    <HStack gap="none" align="center">
      {currency ? (
        currency === 'AED' ? (
          <Dirham variant={variant} color={color} />
        ) : (
          <Text variant={variant} color={color}>
            {currency}
          </Text>
        )
      ) : null}
      <Text variant={variant} color={color}>
        {value}
      </Text>
    </HStack>
  );
}

/** The promo service thumbnails shown (first three) on the Available Promotions card. */
const PROMO_SERVICES: ServiceName[] = ['general-cleaning', 'salon-spa', 'handymen'];

/** Overlapping 3D service-icon chips + "+N". Each icon sits in a recessed `tertiary` circle (#F5F5F5 — the
 *  first background step with real contrast on a white card; `secondary` is near-invisible there); the
 *  surface-white ring on each chip separates it from the one behind, so the overlap reads cleanly. */
export function AvatarStack({ extra, services = PROMO_SERVICES, size }: { extra: number; services?: ServiceName[]; size?: number }) {
  const t = useTheme();
  const SIZE = size ?? t.size['28'];
  return (
    <HStack align="center" gap="xs">
      <View style={{ flexDirection: 'row' }}>
        {services.map((s, i) => (
          <View
            key={s}
            style={{
              width: SIZE,
              height: SIZE,
              borderRadius: t.radius.pill,
              backgroundColor: t.background.tertiary,
              borderWidth: t.borderWidth.thin,
              borderColor: t.background.surface,
              marginLeft: i === 0 ? 0 : -t.size['8'],
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ServiceIcon name={s} size={Math.round(SIZE * 0.9)} />
          </View>
        ))}
      </View>
      {extra > 0 ? (
        <Text variant="titleSmall" color="primary">
          +{extra}
        </Text>
      ) : null}
    </HStack>
  );
}

/** A liquid-glass balance card (Justlife Credit / Available Promotions) over the aurora. */
function GlassBalanceCard({
  label,
  amount,
  subtitle,
  info,
  trailing,
  onPress,
  variant = 'glass',
}: {
  label: string;
  amount: string;
  subtitle: string;
  info?: boolean;
  trailing?: React.ReactNode;
  onPress?: () => void;
  variant?: BalanceSurface;
}) {
  const t = useTheme();
  const r = t.radius['2xl'];
  // Non-glass treatments render truthfully everywhere; `glass` is the real DS primitive (device-only).
  const surface =
    variant === 'white'
      ? { backgroundColor: t.background.surface, ...elevationToStyle(t.elevation.raised) }
      : variant === 'tint'
        ? { backgroundColor: t.background.selected, borderWidth: t.borderWidth.hairline, borderColor: t.border.brandDefault }
        : variant === 'flat'
          ? { backgroundColor: t.background.surface }
          : null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${amount}`}
      onPress={onPress}
      style={({ pressed }) => ({ borderRadius: r, transform: [{ scale: pressed ? 0.99 : 1 }], ...(surface ?? {}) })}
    >
      {/* `glass` = DS liquid-glass primitive over the aurora (real glass on iOS 26; flat on the simulator). */}
      {variant === 'glass' ? <GlassSurface radius={r} style={StyleSheet.absoluteFill} /> : null}
      <HStack align="center" gap="sm" style={{ padding: t.space.md }}>
        <VStack gap="xs" style={{ flex: 1 }}>
          <HStack gap="xs" align="center">
            <Text variant="titleSmall" color="primary">
              {label}
            </Text>
            {info ? <Icon name="info" size="sm" color={t.text.secondary} /> : null}
          </HStack>
          <Amount amount={amount} variant="headlineSmall" color="primary" />
          <Text variant="bodyMicro" color="secondary">
            {subtitle}
          </Text>
        </VStack>
        {trailing}
        <Icon name="chevron-right" size="md" color={t.text.secondary} />
      </HStack>
    </Pressable>
  );
}

/**
 * A credit-package tier card (carousel). Centered "compact ladder": one clear focal — the **You Get**
 * value — with the quiet "You Pay" pair inline beneath it; validity + the gold CTA are pinned to a shared
 * baseline so all cards line up.
 */
export function PackageTile({ data, onTopUp }: { data: WalletPackage; onTopUp?: () => void }) {
  const t = useTheme();
  const TILE_WIDTH = t.size['160'] + t.size['8']; // 168 — token-composed, no raw literal
  const TILE_MIN_HEIGHT = t.size['200'] + t.size['40']; // shared floor → equal rows (AGENTS #13)
  const TINT: Record<CreditPackageTier, string> = {
    basic: t.color.creditPackage.basicBg,
    smart: t.color.creditPackage.smartBg,
    super: t.color.creditPackage.superBg,
  };
  return (
    <View style={{ width: TILE_WIDTH, paddingTop: t.space.sm }}>
      {/* Most-Popular chip straddles the top edge (absolute → never changes the tile height). It sits a touch
          INTO the card (top: space.xs) so it reads attached, not floating. The Badge's own alignSelf:'flex-start'
          overrides the container's alignItems, so center it explicitly. */}
      {data.popular ? (
        <View style={{ position: 'absolute', top: t.space.xs, left: 0, right: 0, alignItems: 'center', zIndex: 1 }}>
          <Badge tone="brand" style={{ alignSelf: 'center' }}>Most Popular</Badge>
        </View>
      ) : null}
      <VStack
        align="center"
        style={{ minHeight: TILE_MIN_HEIGHT, backgroundColor: TINT[data.tone], borderRadius: t.radius.lg, paddingVertical: t.space.md, paddingHorizontal: t.space.md }}
      >
        {/* Header unit: the savings seal sits with its tier name (grouped, not floating). */}
        <VStack align="center" gap="xs">
          <Text variant="titleSmall" color="promoDark" style={{ letterSpacing: 0.8 }}>
            {data.tier}
          </Text>
          <Badge tone="rating" style={{ alignSelf: 'center' }}>
            {data.save}
          </Badge>
        </VStack>

        {/* "Compact ladder" (the user's pick of the hierarchy variants): the You-Get focal floats centred
            between header and footer, with the quiet You-Pay pair INLINE on one line beneath it — the old
            six stacked rows read as four. */}
        <View style={{ flex: 1, minHeight: t.space.sm }} />
        <Text variant="labelXSmall" color="secondary">
          You Get
        </Text>
        <Amount amount={`AED ${data.get}`} variant="headlineSmall" color="promoDark" />
        <View style={{ height: t.space.xs }} />
        <HStack gap="xs" align="center">
          <Text variant="labelXSmall" color="secondary">
            You Pay
          </Text>
          <Amount amount={`AED ${data.pay}`} variant="titleSmall" color="secondary" />
        </HStack>

        {/* Flexible gap → validity + CTA share a baseline across all cards. */}
        <View style={{ flex: 1, minHeight: t.space.md }} />

        {/* Bottom group — quiet validity, then the gold CTA. */}
        <VStack align="center" gap="sm" style={{ alignSelf: 'stretch' }}>
          <Text variant="bodyMicro" color="secondary">
            {data.validity}
          </Text>
          <Button variant="secondary" size="xs" shape="pill" onPress={onTopUp}>
            Buy now
          </Button>
        </VStack>
      </VStack>
    </View>
  );
}

/** Justlife Gift Card promo banner — flat bordered card (no shadow). Illustration is a GREEN placeholder. */
export function GiftBanner({ onSend }: { onSend?: () => void }) {
  const t = useTheme();
  return (
    <Card padded bordered elevation="none">
      <HStack gap="md" align="center">
        <VStack gap="sm" style={{ flex: 1 }}>
          <Text variant="titleMedium">Justlife Gift Card</Text>
          <Text variant="bodyXSmall" color="secondary">
            {GIFT_COPY}
          </Text>
          <View style={{ alignSelf: 'flex-start' }}>
            <Button variant="primary" size="xs" shape="pill" onPress={onSend}>
              Send Now
            </Button>
          </View>
        </VStack>
        {/* 3D gift illustration (Figma `gift_card_icon`, transparent PNG). */}
        <Image
          source={giftCard}
          resizeMode="contain"
          style={{ width: t.size['96'], height: t.size['96'] }}
        />
      </HStack>
    </Card>
  );
}

/**
 * **Wallet** tab — built in the DS on the shared **`PageShell`** layered header (same scaffold as Bookings /
 * Profile): a brand **aurora band** carrying the "Wallet" title (`titleLarge`, at the SAME coordinate as the
 * Bookings title — AGENTS #38) + two **liquid-glass** balance cards, over a **rounded-top content card** that
 * holds the **Credit Packages** carousel and the **Justlife Gift Card** banner. **Static** — `PageShell
 * pinned` (band fixed, only the content card scrolls; no collapse). Floating `BottomNavigation`. Figma is a
 * reference only — every size is a DS typography variant.
 *
 * The same frame-agnostic screen Storybook (web `Phone` frame) and the Expo app render.
 */
export function WalletScreen({
  safeAreaTop = 44,
  safeAreaBottom,
  activeTab = 'wallet',
  onTabPress,
  showNav = true,
  creditAmount = 'AED 250',
  promoAmount = 'AED 120',
  promoExtra = 2,
  packages = DEFAULT_PACKAGES,
  onSeeActivity,
  onPressCredit,
  onPressPromotions,
  onViewAllPackages,
  onTopUp,
  onSendGift,
  onNavCompactChange,
  balanceVariant = 'flat',
}: WalletScreenProps) {
  const t = useTheme();
  const bottom = safeAreaBottom ?? t.safeArea.bottom;
  // Shrink the floating nav once the content scrolls (Instagram pattern) — same on every tab.
  const { compact: navCompact, onScroll: onNavScroll } = useNavShrink(onNavCompactChange);

  return (
    <PageShell
      pinned
      band={<ScreenAurora />}
      // Band = safe inset + title row + the two glass cards + a ~24px gap before the content card. The band
      // already carries ~6px of slack below the cards, so the explicit add is space.lg − size.6 to net 24px.
      bandHeight={safeAreaTop + t.size['200'] + t.size['120'] + t.space.lg - t.size['6']}
      // The aurora band IS the header — "Wallet" title + the "See Wallet Activity" pill share one row, then
      // the two glass balance cards. Title coordinate matches Bookings (safeAreaTop + space.md) — AGENTS #38.
      bandContent={
        <View style={{ flex: 1, paddingTop: safeAreaTop + t.space.md, paddingHorizontal: t.space.md }}>
          {/* Fixed-height title row → the title's Y is independent of the trailing control's height, so it
              lands at the SAME coordinate as every other screen's title (AGENTS #38). */}
          <HStack align="center" justify="space-between" gap="sm" style={{ height: t.size['40'], marginBottom: t.space.md }}>
            <Text variant="titleLarge">Wallet</Text>
            {/* DS pill affordance (btn.pill) — replaces the bespoke header pill. */}
            <Button variant="pill" size="xs" shape="pill" onPress={onSeeActivity}>
              See Wallet Activity
            </Button>
          </HStack>
          <VStack gap="sm">
            <GlassBalanceCard
              label="Justlife Credit"
              info
              amount={creditAmount}
              subtitle="Enjoy this credit across all our services"
              onPress={onPressCredit}
              variant={balanceVariant}
            />
            <GlassBalanceCard
              label="Available Promotions"
              amount={promoAmount}
              subtitle="Available on specific services"
              trailing={<AvatarStack extra={promoExtra} />}
              onPress={onPressPromotions}
              variant={balanceVariant}
            />
          </VStack>
        </View>
      }
      renderHeader={() => null}
      contentInsetTop={t.space.lg}
      onScroll={onNavScroll}
      // Soft upward seam shadow lifting the content card off the band (same as Bookings/Profile).
      cardShadow={{ color: 'rgba(26, 26, 26, 0.08)', offsetX: 0, offsetY: -2, blur: 24, spread: 0 }}
      footerInset={bottom + t.size['120']}
      footer={showNav ? <BottomNavigation items={NAV} activeKey={activeTab} onTabPress={onTabPress} compact={navCompact} safeAreaInset={bottom} /> : undefined}
    >
      {/* Credit Packages — horizontal carousel of tier cards (original baseline). */}
      <HStack justify="space-between" align="center" style={{ paddingHorizontal: t.space.md, marginBottom: t.space.sm }}>
        <Text variant="titleMedium">Credit Packages</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="View all credit packages" onPress={onViewAllPackages} hitSlop={t.space.md}>
          <Text variant="labelXSmall" color="link">
            View all
          </Text>
        </Pressable>
      </HStack>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: t.space.md, gap: t.space.sm, paddingBottom: t.space.xs }}
      >
        {packages.map((p) => (
          <PackageTile key={p.tier} data={p} onTopUp={() => onTopUp?.(p.tier)} />
        ))}
      </ScrollView>

      {/* Gift card banner */}
      <View style={{ paddingHorizontal: t.space.md, paddingTop: t.space.lg }}>
        <GiftBanner onSend={onSendGift} />
      </View>
    </PageShell>
  );
}
