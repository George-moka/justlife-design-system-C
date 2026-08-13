import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from 'react-native';
import {
  Text,
  HStack,
  VStack,
  Icon,
  Badge,
  ActionRow,
  ThankYouCard,
  BookingSummary,
  PriceDetails,
  InfoCard,
  Confetti,
  useTheme,
} from '../index';
import profilePicClean from '../assets/profilepic_clean.png';

/**
 * The **post-checkout Thank-You / booking-details screen** (Figma `aftercheckout-or-bookingdetails`),
 * SHARED and frame-agnostic — the SAME composition Storybook renders on web (in a `Phone` frame) and the
 * Expo app renders natively. The host feeds the real safe-area insets in; one source of truth, no drift.
 *
 * The **hero is a large media carousel** (image **or** video) that stays **fixed** while the rounded
 * content section scrolls up **over** it (the confirmation card offset up over the seam). The only
 * per-platform bit is HOW the hero is pinned (see `<PinnedHero>` below): web uses CSS `position: sticky`;
 * native keeps the hero as a real in-flow child and counter-translates it by the scroll offset — that
 * keeps the carousel a normal nested horizontal `ScrollView`, so manual swipes / taps work. (The earlier
 * native build floated the hero behind an overlay `ScrollView`, whose pan recogniser ate the swipe.)
 */

// Carousel slides — each is its own promo (media + discount + headline) so swiping changes the content.
// Slide 1 is the approved Figma promo; slides 2-4 are GREEN media + clearly-marked placeholder promos
// (the Figma only specified the first slide).
const SLIDES: { bg: string; discount: string; headline: string }[] = [
  { bg: '#22C55E', discount: '30% off up to D100', headline: 'Solo or duo Massages & facials\nright at home.' },
  { bg: '#16A34A', discount: 'Promo 2', headline: 'Carousel slide 2' },
  { bg: '#1FB457', discount: 'Promo 3', headline: 'Carousel slide 3' },
  { bg: '#15803D', discount: 'Promo 4', headline: 'Carousel slide 4' },
];
// Web serves the approved local profile photo; native (no public dir) loads an equivalent remote photo.
// The approved brand photo, bundled into the DS so BOTH web (Vite) and native (Metro) show the SAME
// image. Vite resolves the import to a string URL; Metro resolves it to a numeric asset id which
// `Image.resolveAssetSource` turns into a uri. Normalise both to a uri string for the `photo` prop.
const PRO_PHOTO =
  typeof profilePicClean === 'string' ? profilePicClean : Image.resolveAssetSource(profilePicClean).uri;
const HERO_H = 448; // the big media carousel — fixed; the page scrolls over it (Figma hero = 448)
const SECTION_TOP = 412; // where the rounded content section begins (overlaps the hero by 36, tracks HERO_H)
const PROMO_BOTTOM = 100; // promo block position from the hero bottom (sits above the floating card)
const IS_WEB = Platform.OS === 'web';

export type ThankYouLeading = 'close' | 'back';

/** White circular control over the hero media. */
function HeroCircle({ icon, onPress, label }: { icon: string; onPress?: () => void; label: string }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={t.space.sm}
      style={({ pressed }) => ({
        width: t.size['40'],
        height: t.size['40'],
        borderRadius: t.radius.pill,
        backgroundColor: t.background.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name={icon} size="md" color={t.icon.primary} />
    </Pressable>
  );
}

/** Hero CTA over the media — white label on both; compact (a touch more on the sides than top/bottom). */
function HeroButton({ label, filled, onPress }: { label: string; filled?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: t.size['6'],
        paddingHorizontal: t.size['20'],
        borderRadius: t.radius.pill,
        backgroundColor: filled ? t.background.brandDefault : 'transparent',
        borderWidth: filled ? 0 : t.borderWidth.default,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text variant="labelXSmall" style={{ color: '#FFFFFF' }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Carousel progress dots (active dot is a longer brand pill). */
function CarouselDots({ count, active }: { count: number; active: number }) {
  const t = useTheme();
  return (
    <HStack gap="xs" align="center" justify="center">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === active ? t.size['16'] : t.size['4'],
            height: t.size['4'],
            borderRadius: t.radius.pill,
            backgroundColor: i === active ? t.background.brandDefault : t.background.surface,
            opacity: i === active ? 1 : 0.7,
          }}
        />
      ))}
    </HStack>
  );
}

/**
 * The big media carousel + the real centred overlay chrome (leading control · Help · promo · dots).
 * Swipeable green media slides; the dots are a FIXED overlay so they hold position while the media slides.
 * `leading` switches the top-left control between an `X` close (Thank-You) and a back chevron (the same
 * structure reused for Booking Details).
 */
function HeroChrome({ safeTop }: { safeTop: number }) {
  const t = useTheme();
  const [w, setW] = useState(0);
  const [active, setActive] = useState(0);
  const scRef = useRef<ScrollView>(null);
  const onLayout = (e: LayoutChangeEvent) => setW(Math.round(e.nativeEvent.layout.width));
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (w) setActive(Math.round(e.nativeEvent.contentOffset.x / w));
  };
  // Auto-advance so the carousel visibly slides (loops back to the first slide).
  useEffect(() => {
    if (!w) return;
    const id = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % SLIDES.length;
        scRef.current?.scrollTo({ x: next * w, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [w]);

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      {/* Each slide is its own promo — swiping (or auto-advance) changes both the media and the content. */}
      <ScrollView ref={scRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEventThrottle={16} onScroll={onScroll} style={{ flex: 1 }}>
        {SLIDES.map((s, i) => (
          <View key={i} style={{ width: w || 375, height: '100%', backgroundColor: s.bg }}>
            {/* Media placeholder label (image OR video → GREEN). */}
            <VStack align="center" style={{ position: 'absolute', top: safeTop + t.size['72'], left: 0, right: 0 }}>
              <Icon name="image" size="xl" color="#FFFFFF" />
              <Text variant="labelXSmall" align="center" style={{ color: '#FFFFFF', marginTop: t.space.xs }}>
                Image / video {i + 1}
              </Text>
            </VStack>
            {/* Per-slide promo (discount + headline + CTAs) — these slide with the media. The dots do
                NOT live here; `paddingBottom` reserves the strip the fixed dots overlay occupies. */}
            <VStack gap="sm" align="center" style={{ position: 'absolute', left: t.space.md, right: t.space.md, bottom: PROMO_BOTTOM, paddingBottom: t.size['16'] }}>
              <Badge tone="rating" icon="tag" style={{ alignSelf: 'center' }}>
                {s.discount}
              </Badge>
              <Text variant="labelBase" align="center" style={{ color: '#FFFFFF' }}>
                {s.headline}
              </Text>
              <HStack gap="sm" align="center" justify="center">
                <HeroButton label="Book Now" filled onPress={() => {}} />
                <HeroButton label="Save for Later" onPress={() => {}} />
              </HStack>
            </VStack>
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots — a FIXED overlay (NOT inside the scrolling slides) so they hold their position
          while the media + promo slide past. `active` updates from the carousel's onScroll. */}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: PROMO_BOTTOM, alignItems: 'center' }}>
        <CarouselDots count={SLIDES.length} active={active} />
      </View>
    </View>
  );
}

/**
 * The pinned top chrome — leading control (close/back) · Help. Rendered at the SCREEN root (a fixed overlay
 * outside the hero's scroll/transform) so the leading control is always hit-testable on native (a control
 * nested inside the counter-translated hero had an unreliable touch target on iOS) and stays put as the
 * content scrolls. `box-none` lets swipes/scroll pass through to the carousel; the buttons stay tappable.
 */
function TopChrome({ safeTop, leading, onLeadingPress }: { safeTop: number; leading: ThankYouLeading; onLeadingPress?: () => void }) {
  const t = useTheme();
  return (
    <HStack align="center" justify="space-between" pointerEvents="box-none" style={{ position: 'absolute', top: safeTop, left: t.space.md, right: t.space.md }}>
      <HeroCircle
        icon={leading === 'close' ? 'x' : 'chevron-left'}
        label={leading === 'close' ? 'Close' : 'Back'}
        onPress={onLeadingPress}
      />
      <HStack gap="xs" align="center" style={{ backgroundColor: t.background.surface, borderRadius: t.radius.pill, paddingHorizontal: t.space.sm, height: t.size['32'] }}>
        <Icon name="headphones" size="sm" color={t.icon.primary} />
        <Text variant="labelXSmall" color="primary">
          Help
        </Text>
      </HStack>
    </HStack>
  );
}

/** The rounded content section that scrolls up over the hero — all the approved booking-details content. */
function ContentSection({ safeAreaBottom, style }: { safeAreaBottom: number; style?: ViewStyle }) {
  const t = useTheme();
  return (
    <VStack
      gap="md"
      style={{
        // Pulled up over the hero's bottom edge (the floating-card look); tracks HERO_H − SECTION_TOP.
        marginTop: -(HERO_H - SECTION_TOP),
        backgroundColor: t.background.canvas,
        borderTopLeftRadius: t.radius['2xl'],
        borderTopRightRadius: t.radius['2xl'],
        paddingHorizontal: t.space.md,
        paddingBottom: safeAreaBottom + t.space.lg,
        ...style,
      }}
    >
      {/* Confirmation card — offset up over the section's top edge, with a shadow so it floats. */}
      <ThankYouCard
        title="Professional assigned"
        message={"We'll arrive between\n13.00-14.00."}
        onPress={() => {}}
        professional={{ name: 'Leila Mary', rating: '4.7', reviewCount: '12', category: 'clean', photo: PRO_PHOTO }}
        actions={[
          { label: 'Chat', icon: 'message-circle' },
          { label: 'Call', icon: 'phone' },
        ]}
        style={{ marginTop: -t.size['48'] }}
      />

      <InfoCard tone="accent" icon="heart">
        Show kind gestures, they go a long way
      </InfoCard>

      <VStack gap="sm">
        <ActionRow icon="banknote" label="Pay Pending Amount" badge="1" onPress={() => {}} />
        <ActionRow icon="pencil" label="Edit this booking only" onPress={() => {}} />
      </VStack>

      <BookingSummary
        title="Booking Details"
        details={[
          { label: 'Status', value: 'Confirmed' },
          { label: 'Reference Code', value: '043DD43' },
          { label: 'Frequency', value: 'One time' },
          { label: 'Service', value: 'Home Cleaning' },
          { label: 'Date', value: '27 Jul 2022' },
          { label: 'Start time', value: '09:00-09:30' },
          { label: 'Service Details', value: '2 hours, 3 cleaners' },
          { label: 'Material', value: 'No' },
        ]}
      />

      <PriceDetails
        title="Price Details"
        rows={[
          { label: 'Subtotal', value: 'AED 700.00' },
          { label: 'Discount', value: '-AED 100.00', tone: 'success' },
          { label: 'Service Fee', value: 'AED 10.00', info: true },
        ]}
        total={{ label: 'Total (Inc VAT)', value: 'AED 610.00' }}
        paymentMethod={{ label: 'Payment Method', value: '**** 0021', logo: 'visa' }}
        footer={{ label: 'Show Receipt', onPress: () => {} }}
      />
    </VStack>
  );
}

/**
 * The shared, frame-agnostic Thank-You screen. The host supplies the safe-area insets and the leading
 * affordance: Thank-You passes `leading="close"` (X → home); Booking Details passes `leading="back"`.
 */
export function ThankYouScreen({
  safeAreaTop,
  safeAreaBottom,
  leading = 'close',
  onLeadingPress,
  confetti = true,
}: {
  safeAreaTop: number;
  safeAreaBottom: number;
  leading?: ThankYouLeading;
  onLeadingPress?: () => void;
  /**
   * Fire the celebratory arrival confetti. Default `true` (the post-checkout Thank-You). Pass `false` for the
   * **booking-details variant** — viewing an existing booking from a list is not a fresh celebration.
   */
  confetti?: boolean;
}) {
  const t = useTheme();
  // Native pins the hero by counter-translating it against the vertical scroll offset (see below).
  const scrollY = useRef(new Animated.Value(0)).current;
  const hero = <HeroChrome safeTop={safeAreaTop} />;

  return (
    <View style={{ flex: 1, backgroundColor: t.background.canvas, overflow: 'hidden' }}>
      {IS_WEB ? (
        // WEB: one normal vertical ScrollView; the hero is `position: sticky` so it stays put while the
        // content section scrolls UP and OVER it (content has the higher zIndex). The hero stays a real
        // in-flow element, so its carousel + CTAs stay swipeable/tappable with no pointer-events juggling.
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ position: 'sticky' as unknown as 'absolute', top: 0, height: HERO_H, zIndex: 0 }}>{hero}</View>
          <ContentSection safeAreaBottom={safeAreaBottom} style={{ zIndex: 1 }} />
        </ScrollView>
      ) : (
        // NATIVE: one vertical Animated.ScrollView. The hero is a real in-flow child translated DOWN by
        // the scroll offset, so it appears pinned at the top while the content scrolls over it. Because the
        // hero is in-flow (not an overlay), its nested horizontal carousel gets manual swipes natively.
        <Animated.ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        >
          <Animated.View style={{ height: HERO_H, transform: [{ translateY: scrollY }] }}>{hero}</Animated.View>
          <ContentSection safeAreaBottom={safeAreaBottom} />
        </Animated.ScrollView>
      )}
      {/* Celebration — confetti rises from the bottom once, on arrival. Decorative overlay (no touches).
          Suppressed in the booking-details variant (`confetti={false}`). */}
      {confetti ? <Confetti origin="bottom" count={36} /> : null}
      {/* Pinned leading control + Help — at the screen root (not inside the scrolling hero) so the back/close
          button is reliably tappable on native and stays put while content scrolls. */}
      <TopChrome safeTop={safeAreaTop} leading={leading} onLeadingPress={onLeadingPress} />
    </View>
  );
}
