import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import {
  useTheme,
  Text,
  HStack,
  VStack,
  Icon,
  Button,
  Dirham,
  PageShell,
  ScreenAurora,
  BottomNavigation,
} from '../index';
import { useNavShrink } from '../lib/useNavShrink';
import { elevationToStyle } from '../theme/style-helpers';
import {
  NAV,
  DEFAULT_PACKAGES,
  Amount,
  AvatarStack,
  GiftBanner,
  PackageTile,
  splitAmount,
  type WalletScreenProps,
} from './WalletScreen';

export type WalletAltScreenProps = Omit<WalletScreenProps, 'balanceVariant'>;

/**
 * **Wallet — alternative composition ("hero ledger", WIP).** Same content, same components, recomposed
 * (AGENTS #25) around one idea per zone:
 *
 * - The aurora band carries ONE focal — the spendable **Justlife Credit**, LEFT-aligned on the page's
 *   text axis (only Profile centres, because its hero is an avatar). The dirham symbol and the numeral
 *   render at the SAME display size and colour — one amount, one unit (user rule).
 * - **Available Promotions** is a slim white ledger row at the top of the content card — amount with the
 *   mini 3D-icon stack under it; same copy, half the height of the old card.
 * - The approved **PackageTile** carousel and the original **GiftBanner** are reused untouched; the page
 *   scrolls naturally if it needs to (composition sets the rhythm, not a no-scroll constraint).
 *
 * WIP note: the hero numeral is 33/40 — the odd type scale (…15 → 19 → 23) extended one display step.
 * NOT a token yet (rule: never invent tokens silently) — flagged for approval; bake as a display variant
 * or drop to `headlineSmall` 23 on the user's call.
 */
export function WalletAltScreen({
  safeAreaTop = 0,
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
}: WalletAltScreenProps) {
  const t = useTheme();
  const bottom = safeAreaBottom ?? t.safeArea.bottom;
  // Shrink the floating nav once the content scrolls (Instagram pattern) — same on every tab.
  const { compact: navCompact, onScroll: onNavScroll } = useNavShrink(onNavCompactChange);
  const credit = splitAmount(creditAmount);
  // WIP display size for the hero numeral (33/40): the all-odd scale's next step — Poppins/weight/spacing
  // come from the headlineSmall variant; only size + leading are overridden. See the header note.
  const heroType = { fontSize: 33, lineHeight: 40 };

  return (
    <PageShell
      pinned
      band={<ScreenAurora />}
      // Band = safe inset + title row (16+40) + lg gap + the ~86px hero block + a ~26px gap to the card
      // (the card overlaps 24 up into the band). Token-composed: 200 + 16.
      bandHeight={safeAreaTop + t.size['200'] + t.space.md}
      bandContent={
        <View style={{ flex: 1, paddingTop: safeAreaTop + t.space.md, paddingHorizontal: t.space.md }}>
          {/* Fixed-height title row → the title lands at the SAME Y as every screen (AGENTS #38). */}
          <HStack align="center" justify="space-between" gap="sm" style={{ height: t.size['40'], marginBottom: t.space.lg }}>
            <Text variant="titleLarge">Wallet</Text>
            <Button variant="pill" size="xs" shape="pill" onPress={onSeeActivity}>
              See Wallet Activity
            </Button>
          </HStack>
          {/* Credit hero — the band's single focal, on the page's left text axis. No card chrome: the
              number sits directly on the aurora (lean & airy, #22); the block is the press target. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Justlife Credit, ${creditAmount}`}
            onPress={onPressCredit}
            style={({ pressed }) => ({ alignSelf: 'flex-start', opacity: pressed ? 0.7 : 1 })}
          >
            <VStack gap="sm" align="flex-start">
              {/* Label recedes to secondary so the amount is the hero's only primary ink. */}
              <HStack gap="xs" align="center">
                <Text variant="titleMedium" color="secondary">
                  Justlife Credit
                </Text>
                <Icon name="info" size="sm" color={t.text.secondary} />
              </HStack>
              {/* Symbol and digits at the SAME size and colour — one amount, one unit (feedback #1).
                  Same font box → the (metrics-matched) font seats both on one baseline. */}
              <HStack gap="xs" align="center">
                {credit.currency === 'AED' ? (
                  <Dirham variant="headlineSmall" color="primary" style={heroType} />
                ) : credit.currency ? (
                  <Text variant="headlineSmall" color="primary" style={heroType}>
                    {credit.currency}
                  </Text>
                ) : null}
                <Text variant="headlineSmall" color="primary" style={heroType}>
                  {credit.value}
                </Text>
              </HStack>
              <Text variant="bodyXSmall" color="secondary">
                Enjoy this credit across all our services
              </Text>
            </VStack>
          </Pressable>
        </View>
      }
      renderHeader={() => null}
      // First content item is a CARD → top gap equals the side padding (page-top-inset rule).
      contentInsetTop={t.space.md}
      onScroll={onNavScroll}
      // Soft upward seam shadow lifting the content card off the band (same as Bookings/Profile).
      cardShadow={{ color: 'rgba(26, 26, 26, 0.08)', offsetX: 0, offsetY: -2, blur: 24, spread: 0 }}
      footerInset={bottom + t.size['120']}
      footer={showNav ? <BottomNavigation items={NAV} activeKey={activeTab} onTabPress={onTabPress} compact={navCompact} safeAreaInset={bottom} /> : undefined}
    >
      {/* Available Promotions — a slim ledger row on a strict two-row grid so nothing floats:
          row 1 pairs the title with the amount, row 2 pairs the subtitle with the icon chips
          (each row shares one baseline/axis); the chevron rides its own centred axis on the right. */}
      <View style={{ paddingHorizontal: t.space.md }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Available Promotions, ${promoAmount}`}
          onPress={onPressPromotions}
          style={({ pressed }) => ({
            backgroundColor: t.background.surface,
            borderRadius: t.radius.card,
            paddingVertical: t.space.md,
            paddingLeft: t.space.md,
            // Right padding reserves the chevron's centred column (icon md 20 + its gaps).
            paddingRight: t.space.md + t.iconSize.md + t.space.sm,
            transform: [{ scale: pressed ? 0.99 : 1 }],
            ...elevationToStyle(t.elevation.raised),
          })}
        >
          {/* Row 1 — name ↔ amount share the first line; flex-end seats their text boxes together. */}
          <HStack gap="sm" align="flex-end" justify="space-between">
            <Text variant="titleMedium" color="primary" style={{ flexShrink: 1 }}>
              Available Promotions
            </Text>
            {/* The money steps UP a size (feedback: amounts must carry presence). */}
            <Amount amount={promoAmount} variant="titleLarge" color="primary" />
          </HStack>
          {/* Row 2 — subtitle ↔ icon chips share the second line. */}
          <HStack gap="sm" align="center" justify="space-between" style={{ marginTop: t.space.xs }}>
            <Text variant="bodyXSmall" color="secondary" style={{ flexShrink: 1 }}>
              Available on specific services
            </Text>
            <AvatarStack extra={promoExtra} size={t.iconSize.md} />
          </HStack>
          {/* Chevron — its own vertically-centred axis at the card's right edge. */}
          <View style={{ position: 'absolute', right: t.space.md, top: 0, bottom: 0, justifyContent: 'center' }}>
            <Icon name="chevron-right" size="md" color={t.text.secondary} />
          </View>
        </Pressable>
      </View>

      {/* Credit Packages — the approved tier-card carousel, reused untouched. */}
      <HStack
        justify="space-between"
        align="center"
        style={{ paddingHorizontal: t.space.md, marginTop: t.space.lg, marginBottom: t.space.sm }}
      >
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

      {/* Gift card banner — the original, untouched. */}
      <View style={{ paddingHorizontal: t.space.md, paddingTop: t.space.lg }}>
        <GiftBanner onSend={onSendGift} />
      </View>
    </PageShell>
  );
}
