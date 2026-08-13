import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, PanResponder, Pressable, useWindowDimensions, View } from 'react-native';
import {
  useTheme,
  Text,
  HStack,
  VStack,
  Icon,
  Button,
  Confetti,
  EmptyState,
  ErrorState,
  Skeleton,
  SkeletonGroup,
  SegmentedControl,
  PlanBookingCard,
  PageShell,
  ScreenAurora,
  ThankYouScreen,
  BottomNavigation,
  type BottomNavItem,
  type PlanBookingCardProps,
} from '../index';
import { hapticTap } from '../lib/haptics';
import { useNavShrink } from '../lib/useNavShrink';
import profilePicClean from '../assets/profilepic_clean.png';
import profilePicAssist from '../assets/profilepic_assist.png';

export interface BookingsScreenProps {
  /** Status-bar / notch inset. */
  safeAreaTop?: number;
  /** Home-indicator inset (defaults to `safeArea.bottom`). */
  safeAreaBottom?: number;
  /** Active bottom-nav tab key (defaults to `bookings`). */
  activeTab?: string;
  onTabPress?: (key: string) => void;
  /** Render the bottom nav (default `true`). The Expo app passes `false` and draws ONE persistent nav above
   *  all screens, so the highlight pill slides across tab changes (a per-screen nav would remount and not slide). */
  showNav?: boolean;
  /** Forwards the nav "shrink on scroll" flag up — the Expo app's hoisted nav uses it (this screen renders no
   *  nav of its own there, so it reports `compact` instead of applying it). */
  onNavCompactChange?: (compact: boolean) => void;
  /** Show the loading skeleton instead of the list (while bookings are being fetched). */
  loading?: boolean;
  /** Show the failed-load state instead of the list (takes precedence over `loading`). */
  error?: boolean;
  /** Retry handler for the error state's button. */
  onRetry?: () => void;
  /** Which segment to show first. */
  initialSegment?: 'upcoming' | 'past';
  /** Override the mock data — pass `[]` to see a segment's empty state. */
  upcoming?: PlanBookingCardProps[];
  past?: PlanBookingCardProps[];
}

const NAV: BottomNavItem[] = [
  { key: 'home', label: 'Home', icon: 'house' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-check' },
  { key: 'lifeplus', label: 'life+', icon: 'activity' },
  { key: 'wallet', label: 'Wallet', icon: 'wallet' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

// Bundled pro photos resolve to a URI in BOTH web (Vite → string) and native (Metro → resolveAssetSource),
// so the same photo shows in Storybook and Expo (same pattern as ThankYouScreen).
const PHOTO_CLEAN = typeof profilePicClean === 'string' ? profilePicClean : Image.resolveAssetSource(profilePicClean).uri;
const PHOTO_ASSIST = typeof profilePicAssist === 'string' ? profilePicAssist : Image.resolveAssetSource(profilePicAssist).uri;

// Mock data, mapped onto our existing PlanBookingCard (title + status pill, label→value rows, professional
// with a category-shape avatar + photo cutout, and a primary action). Recurring plan uses `stacked`.
const UPCOMING: PlanBookingCardProps[] = [
  // Recurring plan — the stacked depth card (a subscription).
  {
    title: 'Cleaning Subscription',
    statusLabel: 'Active',
    statusTone: 'success',
    stacked: true,
    rows: [
      { label: 'Package', value: '1 Month' },
      { label: 'Schedule', value: 'Every Tue & Sat', highlight: true },
      { label: 'Next Booking', value: 'Tue, Jun 23, 14:00-14:30', bold: true },
    ],
    professional: { name: 'Jennefer', rating: '4.9', category: 'clean', photo: PHOTO_CLEAN },
    buttonLabel: 'View Schedule',
    buttonIcon: 'calendar',
  },
  // Individual upcoming booking — a normal (flat) card.
  {
    title: 'Home Cleaning',
    statusLabel: 'Professional Assigned',
    statusTone: 'success',
    rows: [
      { label: 'Schedule', value: 'One-off' },
      { label: 'Date', value: 'Wed, Jun 25, 10:00-12:00', bold: true },
    ],
    professional: { name: 'Jennefer', rating: '4.9', category: 'clean', photo: PHOTO_CLEAN },
    buttonLabel: 'Chat With Professional',
    buttonIcon: 'message-circle',
  },
];

const PAST: PlanBookingCardProps[] = [
  {
    title: 'Home Cleaning',
    statusLabel: 'Cancelled',
    statusTone: 'error',
    rows: [
      { label: 'Schedule', value: 'One-off' },
      { label: 'Date', value: 'Sat, Jun 20, 16:00-16:30' },
    ],
    professional: { name: 'Top-Rated Professional' },
    buttonLabel: 'Book Again',
    buttonIcon: 'rotate-cw',
  },
  {
    title: 'Home Cleaning',
    statusLabel: 'Completed',
    statusTone: 'info',
    rows: [
      { label: 'Schedule', value: 'Every Tue, Sat' },
      { label: 'Date', value: 'Sat, Jun 20, 14:00-14:30' },
    ],
    professional: { name: 'Jennefer', rating: '4.9', category: 'clean', photo: PHOTO_CLEAN },
    onRate: () => {},
  },
  {
    title: 'Home Cleaning',
    statusLabel: 'Completed',
    statusTone: 'info',
    rows: [
      { label: 'Schedule', value: 'Every Tue, Sat' },
      { label: 'Date', value: 'Tue, Jun 16, 14:00-14:30' },
    ],
    professional: { name: 'Jennefer', rating: '4.9', category: 'clean', photo: PHOTO_CLEAN },
    onRate: () => {},
  },
  {
    title: 'Laundry & Dry Cleaning',
    statusLabel: 'Completed',
    statusTone: 'info',
    rows: [
      { label: 'Schedule', value: 'One-off' },
      { label: 'Date', value: 'Mon, Jun 15, 11:00-11:30' },
    ],
    professional: { name: 'Maria', rating: '4.8', category: 'assist', photo: PHOTO_ASSIST },
    onRate: () => {},
  },
  {
    title: 'AC Maintenance',
    statusLabel: 'Completed',
    statusTone: 'info',
    rows: [
      { label: 'Schedule', value: 'One-off' },
      { label: 'Date', value: 'Fri, Jun 12, 09:00-10:00' },
    ],
    professional: { name: 'Hamid', rating: '4.7', category: 'assist', photo: PHOTO_ASSIST },
    onRate: () => {},
  },
  {
    title: 'Deep Cleaning',
    statusLabel: 'Completed',
    statusTone: 'info',
    rows: [
      { label: 'Schedule', value: 'One-off' },
      { label: 'Date', value: 'Tue, Jun 9, 13:00-15:00' },
    ],
    professional: { name: 'Aisha', rating: '4.8', category: 'clean', photo: PHOTO_CLEAN },
    onRate: () => {},
  },
  {
    title: 'Home Cleaning',
    statusLabel: 'Cancelled',
    statusTone: 'error',
    rows: [
      { label: 'Schedule', value: 'One-off' },
      { label: 'Date', value: 'Sun, Jun 7, 10:00-10:30' },
    ],
    professional: { name: 'Top-Rated Professional' },
    buttonLabel: 'Book Again',
    buttonIcon: 'rotate-cw',
  },
];

/** A single booking-card skeleton — a faithful GHOST of `PlanBookingCard`: the same surface (radius
 *  `default`, `size.12` padding, hairline border), the same `gap="sm"/"xs"` rhythm, and ghosts at the real
 *  elements' radii — status `Badge` → `radius.sm`, the xs CTA `Button` → `radius.md`, the 40px pro avatar →
 *  `radius.default` — so nothing is pill-shaped (because the real card isn't) and the swap doesn't shift. */
function BookingCardSkeleton() {
  const t = useTheme();
  const text = t.radius.sm; // text-run ghosts use the smallest real radius
  return (
    <View
      style={{
        width: '100%',
        backgroundColor: t.background.surface,
        borderRadius: t.radius.default,
        borderWidth: t.borderWidth.hairline,
        borderColor: t.border.default,
        padding: t.size['12'],
      }}
    >
      <VStack gap="sm">
        {/* Header — title (titleSmall) + status Badge (radius.sm) */}
        <HStack align="center" gap="sm">
          <Skeleton height={12} width="46%" radius={text} />
          <View style={{ flex: 1 }} />
          <Skeleton height={18} width={76} radius={t.radius.sm} />
        </HStack>
        {/* Detail rows — label (left) + value (right) */}
        <VStack gap="xs">
          <HStack align="center" gap="sm">
            <Skeleton height={9} width="26%" radius={text} />
            <View style={{ flex: 1 }} />
            <Skeleton height={9} width="34%" radius={text} />
          </HStack>
          <HStack align="center" gap="sm">
            <Skeleton height={9} width="20%" radius={text} />
            <View style={{ flex: 1 }} />
            <Skeleton height={9} width="40%" radius={text} />
          </HStack>
        </VStack>
        {/* Divider — same token as the real card's footer rule */}
        <View style={{ height: t.borderWidth.thin, backgroundColor: t.border.default }} />
        {/* Footer — 40px pro avatar + name/rating, xs CTA button (radius.md) */}
        <HStack align="center" gap="sm">
          <Skeleton width={40} height={40} radius={t.radius.default} />
          <VStack gap="xs" style={{ flex: 1 }}>
            <Skeleton height={9} width={88} radius={text} />
            <Skeleton height={16} width={44} radius={t.radius.sm} />
          </VStack>
          <Skeleton height={28} width={104} radius={t.radius.md} />
        </HStack>
      </VStack>
    </View>
  );
}

/** The Bookings loading state — one card skeleton per booking the active segment is about to show (so the
 *  count matches and the swap doesn't add/remove a card), sweeping in unison under one "Loading" region. */
function BookingsListSkeleton({ count }: { count: number }) {
  const t = useTheme();
  return (
    <SkeletonGroup label="Loading bookings" style={{ paddingHorizontal: t.space.md }}>
      <VStack gap="sm">
        {Array.from({ length: count }).map((_, i) => (
          <BookingCardSkeleton key={i} />
        ))}
      </VStack>
    </SkeletonGroup>
  );
}

type RatePhase = 'idle' | 'rated' | 'done';

/**
 * A completed booking that can be rated, built on `PlanBookingCard`'s `footerRight` slot. Tapping the stars
 * locks the rating in and cross-fades to a brief confirmation ("You rated {name}") — with a contained
 * `Confetti` burst for a perfect 5 — then settles into a "Book Again" button. The phase transitions use the
 * motion tokens (a subtle fade + rise). Prototyped on the screen; promote to the DS once the interaction is
 * locked (rule #26 — Storybook-first, bake last).
 */
function RateableBookingCard({ card, onPress }: { card: PlanBookingCardProps; onPress?: () => void }) {
  const t = useTheme();
  const [phase, setPhase] = useState<RatePhase>('idle');
  const [rating, setRating] = useState(0);
  const collect = useRef(new Animated.Value(0)).current; // 0 → 1: gather the stars + write the text in
  const swap = useRef(new Animated.Value(0)).current; // 0 → 1: gathered cell → "Book Again" button

  const STAR = t.iconSize.md; // 20 — the idle / gathered star size
  const GAP = t.size['4']; // 4 — inter-star gap
  const PITCH = STAR + GAP; // per-slot stride
  const COUNT = 5;
  const ROW_W = COUNT * STAR + (COUNT - 1) * GAP; // full idle-row width

  const rate = (n: number) => {
    setRating(n);
    hapticTap(); // every tactile control fires a tap (rule: haptics on tactile controls)
    if (n === 5) hapticTap(); // a second beat marks the perfect score — the confetti moment
    setPhase('rated');
  };

  // Entering 'rated': gather the stars + reveal the text, hold, then settle into "Book Again". The end-state is
  // also forced via setValue (settle-timeout) so it holds even if rAF is starved (headless preview).
  useEffect(() => {
    if (phase !== 'rated') return;
    const dur = t.motion.duration.slow + t.motion.duration.fast;
    const a = Animated.timing(collect, { toValue: 1, duration: dur, easing: Easing.bezier(...t.motion.easing.decelerate), useNativeDriver: true });
    a.start();
    const settle = setTimeout(() => collect.setValue(1), dur + 60);
    const toDone = setTimeout(() => setPhase('done'), 1800);
    return () => {
      a.stop();
      clearTimeout(settle);
      clearTimeout(toDone);
    };
  }, [phase, collect, t]);

  // Entering 'done': cross-fade + scale the gathered cell into the "Book Again" button.
  useEffect(() => {
    if (phase !== 'done') return;
    const a = Animated.timing(swap, { toValue: 1, duration: t.motion.duration.medium, easing: Easing.bezier(...t.motion.easing.standard), useNativeDriver: true });
    a.start();
    const settle = setTimeout(() => swap.setValue(1), t.motion.duration.medium + 60);
    return () => {
      a.stop();
      clearTimeout(settle);
    };
  }, [phase, swap, t]);

  // The star row — 5 stars that, once rated, slide to the last slot (gather) while unfilled ones fade out; the
  // result text writes in to the left of the gathered star. Idle stars are the tappable rating input.
  const starRow = (
    <View style={{ width: ROW_W, height: STAR }}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: PITCH,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
          opacity: collect.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 0, 1] }),
          transform: [{ translateX: collect.interpolate({ inputRange: [0, 0.55, 1], outputRange: [-6, -6, 0] }) }],
        }}
      >
        <Text variant="bodyMicro" color={rating === 5 ? 'brand' : 'secondary'} numberOfLines={1} align="right">
          You gave {rating} star{rating === 1 ? '' : 's'}
        </Text>
      </Animated.View>
      {Array.from({ length: COUNT }).map((_, i) => {
        const filled = i < rating;
        const color = filled ? t.background.rating : t.border.default;
        const star = <Icon name="star" size={STAR} color={color} fill={color} />;
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: i * PITCH,
              top: 0,
              width: STAR,
              height: STAR,
              // unfilled stars fade as the row gathers; filled ones stay and stack on the last slot
              opacity: filled ? 1 : collect.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' }),
              transform: [{ translateX: collect.interpolate({ inputRange: [0, 1], outputRange: [0, (COUNT - 1 - i) * PITCH] }) }],
            }}
          >
            {phase === 'idle' ? (
              <Pressable accessibilityRole="button" accessibilityLabel={`Rate ${i + 1} of 5`} hitSlop={GAP} onPress={() => rate(i + 1)}>
                {star}
              </Pressable>
            ) : (
              star
            )}
          </Animated.View>
        );
      })}
    </View>
  );

  const footerRight =
    phase !== 'done' ? (
      starRow
    ) : (
      <View>
        {/* the gathered cell fades out on top; the button (in flow) defines the slot's size */}
        <Animated.View
          pointerEvents="none"
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', opacity: swap.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' }) }}
        >
          {starRow}
        </Animated.View>
        <Animated.View
          style={{
            opacity: swap.interpolate({ inputRange: [0.3, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
            transform: [{ scale: swap.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
          }}
        >
          <Button size="xs" variant="primary" compact leftIcon="rotate-cw" onPress={() => {}}>
            Book Again
          </Button>
        </Animated.View>
      </View>
    );

  return (
    <View style={{ position: 'relative' }}>
      <PlanBookingCard {...card} onPress={onPress} onRate={undefined} footerRight={footerRight} />
      {/* Perfect-score celebration. Emits from the card CENTRE and only rises UP — geometrically it can't
          reach the bottom footer where the gathered star lives. A bottom/corner origin emits from the card's
          bottom edge (the footer strip), so on device the animated pieces sweep across the rating star and it
          reads as "the star isn't there" until they clear (the star itself renders fine — verified). */}
      {rating === 5 ? <Confetti origin="center" count={20} runKey="rated-5" /> : null}
    </View>
  );
}

/**
 * **Bookings screen** (shared, frame-agnostic — rendered by both Storybook and the Expo app). Built on the
 * funnel/Profile `PageShell` layered header: a brand **aurora band** carrying the "Bookings" title + a glass
 * segmented **Upcoming / Past** toggle, over a rounded content card with a **swipeable carousel** of our
 * `PlanBookingCard`s for the active segment (recurring plan uses the `stacked` depth effect; completed
 * bookings show a `StarRating` to rate; empty segments show an empty state). Floating `BottomNavigation`
 * (Bookings active). Data is mock.
 */
export function BookingsScreen({
  safeAreaTop = 0,
  safeAreaBottom,
  activeTab = 'bookings',
  onTabPress,
  showNav = true,
  loading = false,
  error = false,
  onRetry,
  initialSegment = 'upcoming',
  upcoming,
  past,
  onNavCompactChange,
}: BookingsScreenProps) {
  const t = useTheme();
  const bottom = safeAreaBottom ?? t.safeArea.bottom;
  // Shrink the floating nav once the content scrolls (Instagram pattern) — same on every tab.
  const { compact: navCompact, onScroll: onNavScroll } = useNavShrink(onNavCompactChange);
  const [segment, setSegment] = useState<'upcoming' | 'past'>(initialSegment);
  // A tapped booking opens its detail (the Thank-You page, with a Back control); `null` = the list.
  const [detail, setDetail] = useState<PlanBookingCardProps | null>(null);
  const upcomingList = upcoming ?? UPCOMING;
  const pastList = past ?? PAST;

  const tabItems = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
  ];

  // Carousel: BOTH pages render side by side in a 2×-wide row that slides between them — no content swap, so
  // no blink. Page width = the carousel's measured CONTAINER width (not the device window): on a device the
  // container == screen width, but in the Storybook Phone frame the window is the iframe (≠ the 375px frame),
  // so measuring keeps the pages inside the frame. Window width is the fallback until the first layout.
  // Driven on the JS driver so the pan gesture can `setValue()` the same node (no mixing native + JS drivers).
  const { width: windowW } = useWindowDimensions();
  const [measuredW, setMeasuredW] = useState(0);
  // Locks PageShell's vertical scroll while a horizontal swipe is in progress, so the page can't drift
  // vertically mid-swipe (the gesture owns one axis at a time).
  const [pageScrollEnabled, setPageScrollEnabled] = useState(true);
  const pageW = measuredW || windowW;
  const PAGES = 2;
  const index = segment === 'upcoming' ? 0 : 1;
  const pageX = useRef(new Animated.Value(-index * pageW)).current;

  // Latest geometry for the once-created PanResponder; `baseX` captures the offset at gesture start.
  const carouselRef = useRef({ index, pageW });
  carouselRef.current = { index, pageW };
  const baseX = useRef(0);

  // Each page's natural content height. The viewport tracks the ACTIVE page's height (interpolated across the
  // slide) so a short segment (e.g. 2 Upcoming cards) doesn't inherit the taller segment's scroll length —
  // both pages share one row, so without this the row is as tall as the tallest page (Past).
  const [heights, setHeights] = useState<[number, number]>([0, 0]);
  const setPageHeight = useCallback(
    (p: number, h: number) =>
      setHeights((prev) => (prev[p] === h ? prev : p === 0 ? [h, prev[1]] : [prev[0], h])),
    [],
  );

  const snapTo = useCallback(
    (targetIndex: number) => {
      Animated.spring(pageX, {
        toValue: -targetIndex * carouselRef.current.pageW,
        useNativeDriver: false,
        bounciness: 0,
        speed: 16,
      }).start();
    },
    [pageX],
  );

  // Swipe between segments — the row FOLLOWS the finger, then snaps on release by distance OR velocity. Claims
  // only clearly-horizontal drags (small threshold + horizontal dominance), so vertical scrolling and card
  // taps keep working; `onPanResponderTerminationRequest:false` stops the parent ScrollView reclaiming mid-swipe.
  const swipe = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy) * 1.1,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        setPageScrollEnabled(false); // own the horizontal axis → lock vertical scroll for the swipe
        pageX.stopAnimation((v) => {
          baseX.current = v;
        });
      },
      onPanResponderMove: (_e, g) => {
        const { pageW: w } = carouselRef.current;
        let next = baseX.current + g.dx;
        const min = -(PAGES - 1) * w;
        if (next > 0) next = next * 0.3; // rubber-band before the first page
        else if (next < min) next = min + (next - min) * 0.3; // …and past the last
        pageX.setValue(next);
      },
      onPanResponderRelease: (_e, g) => {
        setPageScrollEnabled(true); // swipe done → restore vertical scroll
        const { index: idx, pageW: w } = carouselRef.current;
        const committed = Math.abs(g.dx) > w * 0.2 || Math.abs(g.vx) > 0.3;
        const target = committed
          ? g.dx < 0
            ? Math.min(idx + 1, PAGES - 1)
            : Math.max(idx - 1, 0)
          : idx;
        if (target === idx) snapTo(idx); // snap back — no segment change to drive it
        else setSegment(target === 1 ? 'past' : 'upcoming'); // commit → the effect snaps
      },
      onPanResponderTerminate: () => {
        setPageScrollEnabled(true);
        snapTo(carouselRef.current.index);
      },
    }),
  ).current;

  // Snap to the active segment whenever it changes (toggle tap OR a committed swipe).
  useEffect(() => {
    snapTo(index);
  }, [index, pageW, snapTo]);

  // Viewport height = the active page's height, interpolated across the slide (pageX 0 → -pageW maps
  // Upcoming → Past). Undefined until both pages have measured (falls back to natural height for one frame).
  const [h0, h1] = heights;
  const viewportHeight =
    h0 && h1 ? pageX.interpolate({ inputRange: [-pageW, 0], outputRange: [h1, h0], extrapolate: 'clamp' }) : undefined;

  // A tapped card pushes its booking-details (Thank-You) page — same screen, but the top-left leading control
  // is a Back chevron that returns to the list (the funnel's Thank-You uses a close X → home instead).
  if (detail) {
    return (
      <ThankYouScreen
        safeAreaTop={safeAreaTop}
        safeAreaBottom={bottom}
        leading="back"
        onLeadingPress={() => setDetail(null)}
        confetti={false}
      />
    );
  }

  return (
    <PageShell
      pinned
      // Fill the content card so the swipe area (below) can extend past the last card into the empty space.
      contentGrow
      scrollEnabled={pageScrollEnabled}
      band={<ScreenAurora />}
      bandHeight={safeAreaTop + t.size['96']}
      // The aurora band IS the header — the "Bookings" title + the Upcoming/Past toggle share one row.
      bandContent={
        <View style={{ flex: 1, paddingTop: safeAreaTop + t.space.md, paddingHorizontal: t.space.md }}>
          {/* Fixed-height title row → the title's Y is independent of the trailing control's height, so it
              lands at the SAME coordinate as every other screen's title (AGENTS #38). */}
          <HStack align="center" justify="space-between" gap="sm" style={{ height: t.size['40'] }}>
            <Text variant="titleLarge">Bookings</Text>
            <SegmentedControl options={tabItems} value={segment} onChange={(k) => setSegment(k as 'upcoming' | 'past')} />
          </HStack>
        </View>
      }
      renderHeader={() => null}
      contentInsetTop={t.space.md}
      onScroll={onNavScroll}
      // Soft upward seam shadow lifting the content card off the band (matches Profile).
      cardShadow={{ color: 'rgba(26, 26, 26, 0.08)', offsetX: 0, offsetY: -2, blur: 24, spread: 0 }}
      footerInset={bottom + t.size['120']}
      footer={showNav ? <BottomNavigation items={NAV} activeKey={activeTab} onTabPress={onTabPress} compact={navCompact} safeAreaInset={bottom} /> : undefined}
    >
      {/* Measure the content-area width and feed it to the carousel as the page width (fits the Phone frame).
          The swipe handlers live HERE (fills the whole content card via flexGrow) — not on the cards row — so a
          horizontal drag anywhere on the page, including the empty space below the last card, switches segments. */}
      <View
        style={{ width: '100%', flexGrow: 1 }}
        {...swipe.panHandlers}
        onLayout={(e) => {
          const w = Math.round(e.nativeEvent.layout.width);
          if (w && w !== measuredW) setMeasuredW(w);
        }}
      >
      {error ? (
        // Failed load — the error state takes the content area; the header chrome stays.
        <ErrorState
          style={{ paddingTop: t.size['96'] }}
          title="Couldn’t load your bookings"
          onRetry={onRetry}
        />
      ) : loading ? (
        // While fetching: one card skeleton per booking the ACTIVE segment will show (count matches the
        // real list, so the swap doesn't add/remove a card). Falls back to 3 if a segment is empty.
        <BookingsListSkeleton count={(segment === 'upcoming' ? upcomingList : pastList).length || 3} />
      ) : (
      /* Carousel viewport — height tracks the ACTIVE page (interpolated across the slide) so a short segment
          doesn't inherit the taller one's scroll length. Both pages live in a 2×-wide row that slides; the
          viewport clips the off page. Horizontal swipe / toggle switches; vertical scrolling stays with PageShell. */
      <Animated.View style={{ width: pageW, overflow: 'hidden', height: viewportHeight }}>
        <Animated.View
          style={{ flexDirection: 'row', width: pageW * 2, transform: [{ translateX: pageX }] }}
        >
          {[upcomingList, pastList].map((list, p) => (
            // Hide the off-screen page from screen readers so only the visible segment is announced.
            <View key={p} aria-hidden={p !== index} style={{ width: pageW }}>
              {/* Measure the natural content height (not the stretched page) so the viewport can size to it. */}
              <View
                onLayout={(e) => setPageHeight(p, Math.round(e.nativeEvent.layout.height))}
                style={{ paddingHorizontal: t.space.md }}
              >
                {list.length ? (
                  <VStack gap="sm">
                    {list.map((b, i) => {
                      const cardKey = `${p}-${i}`;
                      // Completed bookings arrive with `onRate` → the rate → confirm → re-book flow (with a
                      // perfect-5 confetti burst); everything else is a plain card.
                      return b.onRate ? (
                        <RateableBookingCard key={cardKey} card={b} onPress={() => setDetail(b)} />
                      ) : (
                        <PlanBookingCard key={cardKey} {...b} onPress={() => setDetail(b)} />
                      );
                    })}
                  </VStack>
                ) : (
                  <EmptyState
                    icon="calendar"
                    style={{ paddingTop: t.size['96'] }}
                    title={p === 0 ? 'No upcoming bookings' : 'No past bookings'}
                    description={
                      p === 0
                        ? 'When you book a service, it’ll show up here.'
                        : 'Your completed and cancelled bookings will show here.'
                    }
                  />
                )}
              </View>
            </View>
          ))}
        </Animated.View>
      </Animated.View>
      )}
      </View>
    </PageShell>
  );
}
