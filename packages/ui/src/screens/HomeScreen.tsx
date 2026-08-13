import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  useTheme,
  Text,
  HStack,
  VStack,
  Icon,
  Badge,
  SearchBar,
  LinearGradient,
  BottomNavigation,
  NotificationStack,
  type NotificationItem,
  ServiceIcon,
  Skeleton,
  SkeletonGroup,
  type ServiceName,
  type BottomNavItem,
} from '../index';
import { elevationToStyle } from '../theme/style-helpers';
import { useImagesReady } from '../lib/preload';
import { serviceIconSources } from '../components/ServiceIcon';
import { BookAgainCard } from '../components/BookAgainCard';
import { HomeAddressSheet, HOME_ADDRESSES } from './home-address-sheet';
import { RebookingSheet, REBOOKING_PROS } from './rebooking-sheet';
import tileHomeCleaning from '../assets/service-tiles/home-cleaning.webp';
import tileFurnitureCleaning from '../assets/service-tiles/furniture-cleaning.webp';
import tileHomeDeepCleaning from '../assets/service-tiles/home-deep-cleaning.webp';
import tileWomensSalon from '../assets/service-tiles/womens-salon.webp';
import tileWomensSpa from '../assets/service-tiles/womens-spa.webp';
import tileHandyman from '../assets/service-tiles/handyman.webp';
import tileHomePainting from '../assets/service-tiles/home-painting.webp';
import tileLabTests from '../assets/service-tiles/lab-tests.webp';
import tileIvTherapy from '../assets/service-tiles/iv-therapy.webp';
import tileAcCleaning from '../assets/service-tiles/ac-cleaning.webp';
import tilePestControl from '../assets/service-tiles/pest-control.webp';
import tileDisinfection from '../assets/service-tiles/disinfection.webp';
import tileBabysitting from '../assets/service-tiles/babysitting.webp';
import tilePackersMovers from '../assets/service-tiles/packers-movers.webp';
import tilePetGrooming from '../assets/service-tiles/pet-grooming.webp';
import tileVetAtHome from '../assets/service-tiles/vet-at-home.webp';
import offer01 from '../assets/banners/top-offers-01.webp';
import offer02 from '../assets/banners/top-offers-02.webp';
import offer03 from '../assets/banners/top-offers-03.webp';
import pick01 from '../assets/banners/top-picks-01.webp';
import pick02 from '../assets/banners/top-picks-02.webp';
import pick03 from '../assets/banners/top-picks-03.webp';
import pick04 from '../assets/banners/top-picks-04.webp';
import middleBanner from '../assets/banners/middle-banner.webp';

/**
 * **Home screen** — the app's front door, built to the Figma `Homepage → Full` frame and its
 * `Homepage Anatomy` spec. The page is a stack of **modular sections** (CRM-reorderable in the real
 * app), so each one is its own component here and the order lives in one array.
 *
 * Anatomy mapping (numbers are the Figma callouts):
 * 1 Address · 2 Search (sticky on scroll) · 3 Hero banner area + live booking activity · 4 Notifications ·
 * 5 Service icons (2 rows, horizontal) · 6 Rebooking "Book Again" · 7 App banners "Top offers" ·
 * 8 Top picks · 9 New banner area · 10 Service tiles (single / two / multi) · 11 Navigation bar (4 tabs).
 *
 * **Banner areas (7 · 8 · 9) are image slots, not designs** — in the app they're CRM-managed images, so
 * they render as labelled placeholders here (the user's explicit instruction: don't design the banners).
 */

// ── content ─────────────────────────────────────────────────────────────────────────────────────

/**
 * Section 5 — the service-icon grid. `icon` is a DS `ServiceIcon` name; `null` marks a service whose 3D
 * icon the DS doesn't own yet (rendered as a GREEN placeholder so the gap is visible, per the
 * screenshot→DS convention). `tag` is the optional promo ribbon (anatomy 5a).
 */
const SERVICE_ICONS: {
  key: string;
  label: string;
  icon: ServiceName | null;
  tag?: string;
  tagIcon?: string;
  /** Tint tone for the ribbon — ETA tags read `instant`, promos read `successSubtle` (a saving). */
  tagTone?: 'instant' | 'successSubtle';
}[] = [
  // Order + tags follow the LIVE homepage: a tag is either a lightning ETA ("30 Mins") or a promo.
  { key: 'general-cleaning', label: 'General Cleaning', icon: 'general-cleaning', tag: '30 Mins', tagIcon: 'instant-bolt', tagTone: 'instant' },
  { key: 'cleaning-subscription', label: 'Cleaning Subscription', icon: 'cleaning-subscription', tag: '40% Off', tagTone: 'successSubtle' },
  { key: 'healthcare', label: 'Healthcare at Home', icon: 'healthcare', tag: '30 Mins', tagIcon: 'instant-bolt', tagTone: 'instant' },
  { key: 'laundry', label: 'Laundry & Dry Cleaning', icon: 'laundry' },
  { key: 'deep-cleaning', label: 'Deep Cleaning', icon: 'deep-cleaning' },
  { key: 'life-plus', label: 'Life Plus', icon: 'life-plus' },
  { key: 'salon-spa', label: 'Salon & Spa at Home', icon: 'salon-spa', tag: '40 Mins', tagIcon: 'instant-bolt', tagTone: 'instant' },
  { key: 'handymen', label: 'Handyman & Maintenance', icon: 'handymen', tag: '60 Mins', tagIcon: 'instant-bolt', tagTone: 'instant' },
  { key: 'ac-cleaning', label: 'AC Cleaning at Home', icon: 'ac-cleaning', tag: '60 Mins', tagIcon: 'instant-bolt', tagTone: 'instant' },
  { key: 'pest-control', label: 'Pest Control', icon: 'pest-control' },
];

/**
 * Section 6 — the professionals you've booked before. The demo cast, their photography and their dates
 * are the design's (see `rebooking-sheet`), so the three cards Home shows are the first three rows of
 * the sheet its "See all" opens — same people, same faces, same copy.
 */
const BOOK_AGAIN = REBOOKING_PROS.slice(0, 3).map((pro) => ({
  ...pro,
  // No "Booked Nx" here. On the carousel's 260 the count competes with the date for the same line and
  // truncates it ("Last served on …"); it belongs in the sheet, where the card has the full width.
  bookedCount: undefined,
}));

/**
 * What the first screenful is MADE of. The feed holds its skeleton until these are warm: paint the boxes
 * first and fill them a beat later and the screen reads as broken, not as loading (#31 — the ghost exists
 * so the swap is invisible, which only works if the real thing arrives complete).
 */
const ABOVE_THE_FOLD: number[] = [
  ...serviceIconSources(SERVICE_ICONS.map((i) => i.icon).filter(Boolean) as ServiceName[]),
  ...(BOOK_AGAIN.map((p) => p.photo).filter((p) => typeof p === 'number') as number[]),
  offer01,
  offer02,
  offer03,
];

/**
 * Section 10 — service tiles, grouped by vertical. Every tile is the SAME size and every section is a
 * horizontal row; the service name sits **outside** the image (the new design; the old one overlaid it).
 */
interface TileSection {
  key: string;
  title: string;
  /** `photo` keys into `TILE_PHOTOS` (the design's own exports). */
  tiles: { label: string; photo?: string }[];
}

const TILE_SECTIONS: TileSection[] = [
  {
    key: 'general-cleaning',
    title: 'General Cleaning 🧽',
    tiles: [{ label: 'Home Cleaning', photo: 'home-cleaning' }, { label: 'Furniture Cleaning', photo: 'furniture-cleaning' }, { label: 'Home Deep Cleaning', photo: 'home-deep-cleaning' }],
  },
  {
    key: 'salon-spa',
    title: 'Salon & Spa at Home 💅',
    tiles: [{ label: "Women's Salon", photo: 'womens-salon' }, { label: "Women's Spa", photo: 'womens-spa' }, { label: "Men's Salon", photo: 'mens-salon-cdn' }],
  },
  {
    key: 'handyman',
    title: 'Handyman & Maintenance 🛠️',
    tiles: [{ label: 'Handyman & Maintenance', photo: 'handyman' }, { label: 'Home Painting', photo: 'home-painting' }],
  },
  {
    key: 'healthcare',
    title: 'Healthcare at Home 🩺',
    tiles: [{ label: 'Lab Tests at Home', photo: 'lab-tests' }, { label: 'IV Therapy at Home', photo: 'iv-therapy' }],
  },
  {
    key: 'ac-cleaning',
    title: 'AC Cleaning ❄️',
    tiles: [{ label: 'AC Cleaning', photo: 'ac-cleaning' }],
  },
  {
    key: 'pest-control',
    title: 'Pest Control & Disinfection 🐛',
    tiles: [{ label: 'Pest Control', photo: 'pest-control' }, { label: 'Disinfection', photo: 'disinfection' }],
  },
  {
    key: 'childcare',
    title: 'Childcare at Home 🍼',
    tiles: [{ label: 'Babysitting at Home', photo: 'babysitting' }],
  },
  {
    key: 'packers',
    title: 'Packers & Movers 🚚',
    tiles: [{ label: 'Packers & Movers', photo: 'packers-movers' }],
  },
  {
    key: 'pet-care',
    title: 'Pet Care at Home 🐕',
    tiles: [{ label: 'Pet Grooming', photo: 'pet-grooming' }, { label: 'Vet at Home', photo: 'vet-at-home' }],
  },
];

/**
 * Service photography is the DESIGN's own — Justlife's branded shots (their team in blue uniforms, in
 * Dubai homes), lifted from the `Homepage → Instant` Figma frame rather than scraped off the marketing
 * site, whose service pages carry generic stock and, for house cleaning, a city skyline.
 *
 * Men's Salon is the one tile the frame clips at its edge, so it keeps a CDN photo until it can be
 * exported from the design.
 */
const TILE_PHOTOS: Record<string, number> = {
  'home-cleaning': tileHomeCleaning,
  'furniture-cleaning': tileFurnitureCleaning,
  'home-deep-cleaning': tileHomeDeepCleaning,
  'womens-salon': tileWomensSalon,
  'womens-spa': tileWomensSpa,
  'handyman': tileHandyman,
  'home-painting': tileHomePainting,
  'lab-tests': tileLabTests,
  'iv-therapy': tileIvTherapy,
  'ac-cleaning': tileAcCleaning,
  'pest-control': tilePestControl,
  'disinfection': tileDisinfection,
  'babysitting': tileBabysitting,
  'packers-movers': tilePackersMovers,
  'pet-grooming': tilePetGrooming,
  'vet-at-home': tileVetAtHome,
};
const MENS_SALON_CDN =
  'https://deax38zvkau9d.cloudfront.net/prod/assets/images/uploads/services/1667550991mens-salon-at-home.webp?f=webp&w=640';

/**
 * CRM banner artwork (anatomy 7 · 8). These are whole compositions — photo, headline, discount, service
 * chip — authored outside the DS and uploaded in the app, so the screen draws them and nothing else: no
 * caption under the card, no tint, no overlay. Exported @3x against the slot (offers 480×600 → 160×200,
 * picks 300×480 → 100×160) so nothing crops or resamples.
 */
const TOP_OFFERS = [offer01, offer02, offer03];
const TOP_PICKS = [pick01, pick02, pick03, pick04];

/** Resolves a tile's `photo` key to something `<Image source>` accepts. */
const tilePhoto = (key: string) => (key === 'mens-salon-cdn' ? { uri: MENS_SALON_CDN } : TILE_PHOTOS[key]);

/** Section 11 — the four tabs from the anatomy (Home · Bookings · Wallet · Profile). */
const NAV: BottomNavItem[] = [
  { key: 'home', label: 'Home', icon: 'house' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-check' },
  { key: 'wallet', label: 'Wallet', icon: 'wallet' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

/** How long each face of the address strip holds before swapping (ms). */
const SWAP_INTERVAL = 3200;

/** How long the demo refresh spins when the host doesn't supply a real reload. */
const REFRESH_DEMO_MS = 1200;

// ── shared bits ─────────────────────────────────────────────────────────────────────────────────

/** GREEN placeholder for artwork the DS doesn't own yet (screenshot→DS convention). */
function MissingArt({ label, size }: { label: string; size?: number }) {
  return (
    <View
      style={{
        width: size ?? 56,
        height: size ?? 56,
        borderRadius: 8,
        backgroundColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
      }}
    >
      <Text variant="labelXXSmall" align="center" style={{ color: '#FFFFFF' }} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

/**
 * A CRM-managed banner slot (anatomy 7 · 8 · 9). The banners themselves are images uploaded in the app,
 * so the DS screen reserves the space and labels it instead of designing artwork.
 */
function BannerSlot({
  label,
  image,
  width,
  height,
  aspectRatio,
  radius,
  artBleed,
}: {
  label: string;
  /** The uploaded artwork. Given one, the slot IS the image — the placeholder is only the empty state. */
  image?: number;
  width?: number | string;
  height?: number;
  /** Width ÷ height from the design. For a slot that FILLS the row: the box grows with the container
   *  and keeps the design's proportions, so a CRM image never crops differently by device. */
  aspectRatio?: number;
  radius?: number;
  /**
   * Negative margins that cancel a transparent margin baked into the artwork (a drop shadow's blur
   * room). Percentages, because they have to track the box: a shadow is a fraction of the export, and
   * RN resolves percentage margins against the parent's WIDTH on both platforms. Without this the
   * shadow's empty pixels count as layout and the banner reads as having a bigger gap under it than
   * every other section (#41 — reserve the depth, don't let it eat the rhythm).
   */
  artBleed?: { top: `${number}%`; bottom: `${number}%` };
}) {
  const t = useTheme();
  const box = {
    width: (width ?? '100%') as number,
    ...(aspectRatio ? { aspectRatio } : { height }),
    borderRadius: radius ?? t.radius.default,
    ...(artBleed ? { marginTop: artBleed.top, marginBottom: artBleed.bottom } : null),
  };

  if (image) {
    return (
      // No border and NO fill behind it: a hairline would read as a frame the composition doesn't have,
      // and a fill would show through artwork that ships on a transparent canvas (the promo card floats
      // with its own shadow). `contain` — the slot carries the export's own ratio, so nothing crops.
      <View style={{ ...box, overflow: 'hidden' }}>
        <Image
          source={image}
          resizeMode="contain"
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel={label}
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <View
      style={{
        ...box,
        backgroundColor: t.background.tertiary,
        borderWidth: t.borderWidth.thin,
        borderColor: t.border.default,
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.space.xs,
      }}
    >
      <Icon name="image" size="md" color={t.icon.secondary} />
      <Text variant="bodyMicro" color="secondary" align="center">
        {label}
      </Text>
    </View>
  );
}

/** Section heading; optional trailing "See all" link (anatomy 6a). Sentence case, like every other screen. */
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  const t = useTheme();
  return (
    <HStack justify="space-between" align="center" style={{ paddingHorizontal: t.space.md }}>
      {/* `titleSmall` (13) is the DS's section-heading size — Wallet set it and Home now matches. */}
      <Text variant="titleSmall">{title}</Text>
      {onSeeAll ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`See all ${title}`} onPress={onSeeAll} hitSlop={t.space.sm}>
          <Text variant="labelXSmall" color="link">
            See all
          </Text>
        </Pressable>
      ) : null}
    </HStack>
  );
}

// ── 3 · hero band ───────────────────────────────────────────────────────────────────────────────

/** The hero's blue gradient — the default state when no marketing hero image is set (anatomy 3). */
function HomeHero() {
  const t = useTheme();
  return <LinearGradient colors={[t.background.brandSubtle, t.background.brandSubtle, t.background.canvas]} style={{ flex: 1 }} />;
}

/**
 * A live booking activity card (anatomy 3.2) — the pro's name + arrival window over a progress track.
 * Shown first in the hero's horizontal list; the marketing banner (a CRM image) follows it.
 */
function LiveActivityCard({ name, window: arrival, progress = 0.35 }: { name: string; window: string; progress?: number }) {
  const t = useTheme();
  return (
    <VStack gap="xs" style={{ width: '100%' }}>
      <HStack justify="space-between" align="center" gap="sm">
        <VStack gap="xs" style={{ flex: 1 }}>
          <Text variant="titleMedium" numberOfLines={1}>
            {`${name} is now in your area`}
          </Text>
          <Text variant="bodyXSmall" color="secondary" numberOfLines={1}>
            {`Arriving between ${arrival}`}
          </Text>
        </VStack>
        <ServiceIcon name="general-cleaning" size={t.size['32']} accessibilityLabel="" />
      </HStack>

      {/* Progress track — filled to the pro's ETA, with the van marker at the head. */}
      <View style={{ height: t.size['8'], borderRadius: t.radius.pill, backgroundColor: t.background.primary, justifyContent: 'center' }}>
        <View style={{ position: 'absolute', left: 0, right: 0, height: t.size['4'], borderRadius: t.radius.pill, backgroundColor: t.background.primary }} />
        <View style={{ width: `${Math.round(progress * 100)}%`, height: t.size['4'], borderRadius: t.radius.pill, backgroundColor: t.background.brandDefault }} />
        <View
          style={{
            position: 'absolute',
            right: 0,
            width: t.size['12'],
            height: t.size['12'],
            borderRadius: t.radius.pill,
            backgroundColor: t.background.primary,
            borderWidth: t.borderWidth.default,
            borderColor: t.background.brandDefault,
          }}
        />
      </View>
    </VStack>
  );
}

/**
 * The address strip **alternates** between two faces, on a slow timer with a soft cross-fade:
 * `📍 Home ⌄` (where we're coming to) ⇄ `⚡ At your door in 30 mins` (how fast). Both faces are laid on
 * top of each other so the row's height never moves; reduce-motion holds the address face (#35).
 */
function AddressStrip({
  label,
  detail,
  eta,
  onPress,
}: {
  label: string;
  /** The address's own detail line, e.g. "Dubai Marina" (Figma `Homepage → Normal`). */
  detail: string;
  /** The instant-service promise, e.g. "At your door in 30 mins" (Figma `Homepage → Instant`). */
  eta: string;
  onPress?: () => void;
}) {
  const t = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showEta, setShowEta] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((r) => alive && setReduceMotion(r));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return; // hold the address face — no looping motion (#35)
    const id = setInterval(() => setShowEta((v) => !v), SWAP_INTERVAL);
    return () => clearInterval(id);
  }, [reduceMotion]);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: showEta ? 1 : 0,
      duration: t.motion.duration.medium,
      easing: Easing.bezier(...(t.motion.easing.standard as [number, number, number, number])),
      useNativeDriver: false,
    }).start();
  }, [showEta, fade, t.motion.duration.medium, t.motion.easing.standard]);

  const normalOpacity = fade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  // Small opposing drift so the change reads as a SWAP, not a flicker.
  const normalShift = fade.interpolate({ inputRange: [0, 1], outputRange: [0, -t.space.xs] });
  const instantShift = fade.interpolate({ inputRange: [0, 1], outputRange: [t.space.xs, 0] });

  /** The leading icon for one state — pin and bolt cross-fade in the same slot. */
  const faceIcon = (icon: string, opacity: Animated.AnimatedInterpolation<number> | Animated.Value, shift: Animated.AnimatedInterpolation<number>) => (
    <Animated.View
      style={{ position: 'absolute', left: 0, top: 0, bottom: 0, justifyContent: 'center', opacity, transform: [{ translateY: shift }] }}
    >
      <Icon name={icon} size="md" color={t.icon.primary} />
    </Animated.View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Service address: ${label}, ${detail}. ${eta}. Change address`}
      onPress={onPress}
      style={({ pressed }) => ({ alignSelf: 'stretch', flexDirection: 'row', gap: t.space.xs, opacity: pressed ? 0.6 : 1 })}
    >
      {/* Icon column — the pin and the bolt cross-fade in the same slot. */}
      <View style={{ width: t.iconSize.md, alignSelf: 'stretch' }}>
        {/* The SOLID address pin, extracted from Figma (`Icons / location-dot-solid`) — Lucide's
            `map-pin` is an outline and filling it closes its inner dot, so this is a brand glyph. */}
        {faceIcon('location-pin', normalOpacity, normalShift)}
        {faceIcon('instant-bolt', fade, instantShift)}
      </View>

      <View style={{ flex: 1 }}>
        {/* Title — constant across both states, so nothing jumps. */}
        <HStack gap="xs" align="center">
          <Text variant="titleMedium">{label}</Text>
          <Icon name="chevron-down" size="sm" color={t.icon.primary} />
        </HStack>
        {/* Subline — the address detail swaps with the instant promise. Fixed height so the strip
            never resizes mid-swap. */}
        <View style={{ height: t.size['16'] }}>
          <Animated.View style={{ position: 'absolute', left: 0, right: 0, opacity: normalOpacity, transform: [{ translateY: normalShift }] }}>
            <Text variant="bodyXSmall" color="secondary" numberOfLines={1}>
              {detail}
            </Text>
          </Animated.View>
          <Animated.View style={{ position: 'absolute', left: 0, right: 0, opacity: fade, transform: [{ translateY: instantShift }] }}>
            <Text variant="bodyXSmall" color="secondary" numberOfLines={1}>
              {eta}
            </Text>
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Hero pager dots — measured 1:1 off the Figma frame: **4pt tall**, a `size.28`-wide active pill and
 * `size.4` inactive dots, `space.xs` apart, all in `background.brandDefault`
 * — the design distinguishes the active page by LENGTH; the inactive dots are dimmed to keep that
 * reading on our deeper brand blue. 4pt (not the 6 I had, nor the rail
 * I tried) keeps the row inside the band's tight budget while still reading at 3–4 pages. The active
 * pill slides between positions with the motion tokens.
 */
function Dots({ count, active }: { count: number; active: number }) {
  const t = useTheme();
  return (
    <HStack gap="xs" align="center" justify="center" accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: count, now: active + 1 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === active ? t.size['28'] : t.size['4'],
            height: t.size['4'],
            borderRadius: t.radius.pill,
            // Dark like the shipped app, but not full-strength ink on a pale band: the active page is
            // one step darker than the rest, and LENGTH does most of the work of saying which is which.
            backgroundColor: t.text.primary,
            opacity: i === active ? t.opacity['60'] : t.opacity['25'],
          }}
        />
      ))}
    </HStack>
  );
}

// ── 4 · notification ────────────────────────────────────────────────────────────────────────────

/**
 * Home's notifications (anatomy 4) — a `NotificationStack`, so the section's height doesn't grow with
 * however many notices happen to be true. Ranked hardest-consequence first: a failed subscription, then
 * a booking that needs input, then the glanceable ones.
 *
 * Demo content, like `HOME_ADDRESSES` — a host passes its own through `notifications`.
 */
export const HOME_NOTIFICATIONS: Omit<NotificationItem, 'onPress' | 'onDismiss'>[] = [
  {
    key: 'payment',
    tone: 'danger',
    icon: 'triangle-alert',
    message: 'Update payment to renew your',
    emphasis: 'Cleaning Subscription.',
  },
  {
    key: 'booking-action',
    tone: 'warning',
    icon: 'bell',
    message: 'You need to take action',
    emphasis: 'related to your booking.',
  },
  {
    key: 'tomorrow',
    tone: 'neutral',
    icon: 'calendar-check',
    emphasisFirst: true,
    emphasis: 'Juniper will serve you tomorrow.',
    message: 'Home Cleaning, 08:00 - 08:30',
  },
  {
    key: 'weather',
    tone: 'neutral',
    icon: 'cloud-rain',
    message: 'Due to poor weather conditions,',
    emphasis: 'bookings may be delayed or rescheduled.',
  },
  {
    key: 'message',
    tone: 'neutral',
    icon: 'message-circle',
    unread: true,
    message: 'New message from',
    emphasis: 'Ahmed Mohammed Joseph',
  },
];

/** Notices that must be resolved carry no close button — dismissing them wouldn't make them untrue. */
const MUST_RESOLVE = new Set(['payment', 'booking-action', 'weather']);

// ── 5 · service icons ───────────────────────────────────────────────────────────────────────────


/**
 * **Why this screen sizes in fixed points.**
 * The Figma frames are a 375pt artboard and the Figma *prototype player* scales that artboard to fit
 * whatever phone it's opened on — which is why the design looks bigger than these numbers when reviewed
 * on a device. The **shipped app does not scale**: measured on the live Home
 * (`screenshots/live-homepage.png`, a 420pt screen) the offer card is 160pt, Book Again is 260pt, the
 * page gutter is 16 and every row gap is 8 — the artboard's own numbers, unchanged. A wider screen buys
 * more *peek* of the next card, not bigger cards.
 */
/**
 * Proportions for the slots that **fill the row** — their width comes from the container, so the height
 * follows the design's ratio instead of a fixed number. (Sizes don't scale; ratios do.)
 */
/**
 * The promo banner spans the content width. Its artwork is a CARD ON A TRANSPARENT CANVAS — a rounded
 * panel with its own soft drop shadow — so the slot takes the FULL canvas ratio (1029 × 383 @3x), not
 * the card's: cropping to the card would cut the shadow off mid-blur. Measured on the export, the card
 * itself lands at 343 × 105 with the shadow filling the rest — 19px of blur room above it and 49 below,
 * which `PROMO_BLEED` takes back out of the layout so the CARD, not the canvas, sits on the page rhythm.
 */
const PROMO_ASPECT = 1029 / 383;
const PROMO_BLEED: { top: `${number}%`; bottom: `${number}%` } = {
  top: `${(-19 / 1029) * 100}%`,
  bottom: `${(-49 / 1029) * 100}%`,
};

/** Figma sizes, in points. Used as-is at every screen width. */
const FIGMA = {
  tile: { w: 76, h: 100 },
  bookAgain: { w: 260, h: 80 },
  // 200, not the file's 191: the offer card is a CRM image slot, so its height is ours to set — and a
  // round 200 is the number the artwork is exported against (160 × 200 → 480 × 600 @3x).
  offer: { w: 160, h: 200 },
  pick: { w: 100, h: 160 },
  serviceTile: { w: 160, h: 80 },
  promo: { h: 110 },
} as const;

/**
 * The row geometry, in POINTS — the design's numbers, used as-is at every screen width.
 *
 * These were scaled by `measuredWidth / 343` for a while, because the Figma *prototype* scales its 375pt
 * artboard to fit the phone and that's how the design gets reviewed. Measuring the **shipped** Home
 * (`screenshots/live-homepage.png`, a 420pt device) settled it: the app does NOT scale — the offer card
 * is 160 there and 160 in Figma, Book Again is 260 in both, the gutter is 16 and the gaps are 8. Scaling
 * made every row ~13% wider than the real app, which is why Book Again read as too wide. What changes
 * with the screen is how much of the NEXT card peeks in, not the cards themselves.
 *
 * `measuredWidth` is still threaded through (from `onLayout`, not `useWindowDimensions()` — the window is
 * 0 on first paint in some hosts) for anything that genuinely needs the container.
 */
function useHomeMetrics() {
  return {
    tileW: FIGMA.tile.w,
    tileH: FIGMA.tile.h,
    bookW: FIGMA.bookAgain.w,
    bookH: FIGMA.bookAgain.h,
    offerW: FIGMA.offer.w,
    offerH: FIGMA.offer.h,
    pickW: FIGMA.pick.w,
    pickH: FIGMA.pick.h,
    serviceTileW: FIGMA.serviceTile.w,
    serviceTileH: FIGMA.serviceTile.h,
    promoH: FIGMA.promo.h,
  };
}

/**
 * One service-icon tile: ONE recessed rounded box holding the 3D icon AND its 2-line label (the label
 * is inside the box, not under it), with an optional promo ribbon overhanging the top edge.
 */
function ServiceIconTile({
  item,
  width,
  height,
  onPress,
}: {
  item: (typeof SERVICE_ICONS)[number];
  width: number;
  height: number;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      onPress={onPress}
      style={({ pressed }) => ({ width, opacity: pressed ? 0.6 : 1 })}
    >
      <View
        style={{
          height,
          borderRadius: t.radius.default,
          backgroundColor: t.background.tertiary,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: t.space.xs,
          paddingVertical: t.space.sm,
          overflow: 'hidden',
        }}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {item.icon ? (
            <ServiceIcon name={item.icon} size={Math.round(height * 0.48)} accessibilityLabel="" />
          ) : (
            <MissingArt label="icon" size={Math.round(height * 0.48)} />
          )}
        </View>
        {/* Fixed two-line box so every tile is identical whatever the label wraps to (#13). */}
        {/* `minHeight`, not a fixed height: on iOS a height smaller than two 13px line boxes clips the
            label to ONE line (web wrapped fine) — the classic web-passes/native-fails trap (#39). */}
        <Text variant="bodyMicro" align="center" numberOfLines={2} style={{ minHeight: t.size['28'] }}>
          {item.label}
        </Text>
      </View>
      {/* Promo ribbon seats ON the tile's top edge with a small overhang — OUTSIDE the clipped box so
          it isn't cut, and absolute so it never changes the tile's height. */}
      {/* Promo ribbon — absolute, so it can never change the tile's box. Measured against the Figma:
          the ribbon is **14 tall and overhangs the box top by 4** (mine was 17 tall overhanging 10,
          which made a tagged tile's total footprint ~8pt taller than its untagged neighbours — the
          "why are the tagged cards taller?" everyone sees). `paddingVertical: 0` trims `Badge`'s 2pt
          padding to the design's tight ribbon without touching the shared component. */}
      {item.tag ? (
        <View style={{ position: 'absolute', top: -t.space.xs, left: 0, right: 0, alignItems: 'center' }}>
          {/* `instant-bolt` is the slim Figma bolt (brand glyph) — Lucide's `zap` is visibly fatter. */}
          <Badge tone={item.tagTone ?? 'instant'} icon={item.tagIcon} style={{ alignSelf: 'center', paddingVertical: 0, paddingHorizontal: t.space.xs }}>
            {item.tag}
          </Badge>
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * The service grid (anatomy 5): **two rows that scroll together as one horizontal unit**, four tiles
 * fully visible with the fifth peeking. Built as a column of two rows inside ONE ScrollView so the rows
 * can never drift apart.
 */
function ServiceIconGrid({ onSelect, tileW, tileH }: { onSelect: (key: string) => void; tileW: number; tileH: number }) {
  const t = useTheme();
  const half = Math.ceil(SERVICE_ICONS.length / 2);
  const rows = [SERVICE_ICONS.slice(0, half), SERVICE_ICONS.slice(half)];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // `paddingTop` gives the promo ribbon its overhang room — without it the scroller clips it.
      contentContainerStyle={{ paddingHorizontal: t.space.md, paddingTop: t.space.sm }}
    >
      <VStack style={{ gap: t.size['12'] }}>
        {rows.map((row, i) => (
          <HStack key={i} gap="sm">
            {row.map((item) => (
              <ServiceIconTile key={item.key} item={item} width={tileW} height={tileH} onPress={() => onSelect(item.key)} />
            ))}
          </HStack>
        ))}
      </VStack>
    </ScrollView>
  );
}

// ── 6 · book again — the card is the DS `BookAgainCard`, shared with the rebooking sheet ─────────

// ── 10 · service tiles ──────────────────────────────────────────────────────────────────────────


/** One service tile — image on top, name BELOW it (the new design; the old one overlaid the name). */
function ServiceTile({
  label,
  image,
  width,
  imageHeight,
  imageAspect,
  onPress,
}: {
  label: string;
  image?: ReturnType<typeof tilePhoto>;
  width?: number | string;
  /** Fixed image height — for a tile in a horizontal scroller, where the width is fixed too. */
  imageHeight?: number;
  /** Width ÷ height — for a tile that FILLS the row, so it keeps the design's proportions. */
  imageAspect?: number;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({ width: width as number, gap: t.space.xs, opacity: pressed ? 0.7 : 1 })}
    >
      {/* CRM-managed photo. Until the real asset is in the repo the tile shows a labelled slot — never
          a stand-in photo of a different service. */}
      {image ? (
        <View
          style={{
            ...(imageAspect ? { aspectRatio: imageAspect } : { height: imageHeight }),
            borderRadius: t.radius.default,
            overflow: 'hidden',
            backgroundColor: t.background.tertiary,
          }}
        >
          <Image source={image} resizeMode="cover" style={{ width: '100%', height: '100%' }} accessibilityIgnoresInvertColors />
        </View>
      ) : (
        <BannerSlot label="Service image" height={imageHeight} aspectRatio={imageAspect} />
      )}
      <Text variant="bodyXSmall" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * A titled tile section. **Every tile in every section is the same size** — the design's own
 * `single` / `two` / `multi` split gave the same card three different footprints down one page, so a
 * service looked more or less important depending on which vertical it happened to sit in. One
 * footprint, one horizontal row, and a section with two tiles simply doesn't scroll.
 */
function ServiceTileSection({
  section,
  tileW,
  tileH,
  onSelect,
}: {
  section: TileSection;
  tileW: number;
  tileH: number;
  onSelect: (label: string) => void;
}) {
  const t = useTheme();
  return (
    <VStack gap="sm">
      <SectionHeader title={section.title} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.space.sm, paddingHorizontal: t.space.md }}>
        {section.tiles.map((tile) => (
          <ServiceTile
            key={tile.label}
            label={tile.label}
            image={tile.photo ? tilePhoto(tile.photo) : undefined}
            width={tileW}
            imageHeight={tileH}
            onPress={() => onSelect(tile.label)}
          />
        ))}
      </ScrollView>
    </VStack>
  );
}

/**
 * The feed's loading ghost (#31 "faithful ghost"): the SAME tile grid and Book Again card geometry the
 * real feed uses, so the swap doesn't move anything — one shared shimmer via `SkeletonGroup`.
 */
function FeedSkeleton({ m }: { m: ReturnType<typeof useHomeMetrics> }) {
  const t = useTheme();
  return (
    <SkeletonGroup>
      <VStack gap="lg">
        <View style={{ paddingHorizontal: t.space.md }}>
          <Skeleton height={t.size['56']} radius={t.radius.default} />
        </View>

        {/* Service icons — two rows, four visible tiles each. */}
        <VStack style={{ gap: t.size['12'], paddingHorizontal: t.space.md }}>
          {[0, 1].map((row) => (
            <HStack key={row} gap="sm">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} width={m.tileW} height={m.tileH} radius={t.radius.default} />
              ))}
            </HStack>
          ))}
        </VStack>

        {/* Book Again — two cards, the second peeking. */}
        <VStack gap="sm">
          <View style={{ paddingHorizontal: t.space.md }}>
            <Skeleton width={t.size['96']} height={t.size['24']} />
          </View>
          <HStack gap="sm" style={{ paddingHorizontal: t.space.md }}>
            {[0, 1].map((i) => (
              <Skeleton key={i} width={m.bookW} height={m.bookH} radius={t.radius.default} />
            ))}
          </HStack>
        </VStack>
      </VStack>
    </SkeletonGroup>
  );
}

// ── the screen ──────────────────────────────────────────────────────────────────────────────────

export interface HomeScreenProps {
  /** Address TITLE only — "Home", "Office" (anatomy 1 keeps the header compact). */
  addressLabel?: string;
  /** The address's detail line — Figma `Homepage → Normal` shows "Dubai Marina" under the title. */
  addressDetail?: string;
  /** The instant promise — Figma `Homepage → Instant` swaps the subline for the ETA. */
  eta?: string;
  /** Status-bar / notch inset. */
  safeAreaTop?: number;
  /** Home-indicator inset (defaults to `safeArea.bottom`). */
  safeAreaBottom?: number;
  activeTab?: string;
  onTabPress?: (key: string) => void;
  /** Render the bottom nav (default `true`). The Expo app passes `false` and hoists one nav. */
  showNav?: boolean;
  /** Forwards the nav "shrink on scroll" flag up (the Expo app's hoisted nav uses it). */
  onNavCompactChange?: (compact: boolean) => void;
  /** Address row tapped — opens the saved-address sheet (anatomy 1). */
  onAddressPress?: () => void;
  /** Search submitted. */
  onSearch?: (query: string) => void;
  /** A service icon / tile tapped (routes into that funnel). */
  onSelectService?: (key: string) => void;
  /** "Book Again" card tapped. */
  onRebook?: (proKey: string) => void;
  /** "See all" on the rebooking section (anatomy 6a). */
  onSeeAllRebooking?: () => void;
  /** A notification tapped — receives the item's `key`. */
  onNotificationPress?: (key: string) => void;
  /**
   * Notices for the stack, in **priority order** (`[0]` is the one shown while collapsed). Defaults to
   * `HOME_NOTIFICATIONS`; pass `[]` for a quiet Home.
   */
  notifications?: Omit<NotificationItem, 'onPress' | 'onDismiss'>[];
  /**
   * Pull-to-refresh. Return a promise and the feed shows its skeleton until it settles; without one the
   * demo spins briefly so the interaction can be felt in Storybook / the prototype.
   */
  onRefresh?: () => Promise<void> | void;
}

export function HomeScreen({
  addressLabel = 'Home',
  addressDetail = 'Dubai Marina',
  eta = 'At your door in 30 mins',
  safeAreaTop = 0,
  safeAreaBottom,
  activeTab = 'home',
  onTabPress,
  showNav = true,
  onNavCompactChange,
  onAddressPress,
  onSearch,
  onSelectService,
  onRebook,
  onSeeAllRebooking,
  onNotificationPress,
  notifications = HOME_NOTIFICATIONS,
  onRefresh,
}: HomeScreenProps) {
  const t = useTheme();
  const bottom = safeAreaBottom ?? t.safeArea.bottom;
  // Every row's geometry, in the design's own points (see `useHomeMetrics`).
  const m = useHomeMetrics();
  const [query, setQuery] = useState('');
  const [heroPage, setHeroPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  // First paint: hold the ghost until the artwork is warm, so the feed arrives complete instead of
  // filling itself in while the user watches.
  const artworkReady = useImagesReady(ABOVE_THE_FOLD);
  /** Pull-to-refresh: the feed swaps to its skeleton while the (host-owned) reload runs. */
  const handleRefresh = () => {
    setRefreshing(true);
    const done = () => setRefreshing(false);
    const p = onRefresh?.();
    if (p && typeof (p as Promise<void>).then === 'function') (p as Promise<void>).then(done, done);
    else setTimeout(done, REFRESH_DEMO_MS);
  };
  const [compact, setCompact] = useState(false);
  const [heroWidth, setHeroWidth] = useState(0);
  // Notifications (anatomy 4). Dismissals are held here so the deck really restacks — a notice that must
  // be resolved gets no `onDismiss`, so it renders a chevron instead of a close button.
  const [dismissed, setDismissed] = useState<string[]>([]);
  const notices: NotificationItem[] = notifications
    .filter((n) => !dismissed.includes(n.key))
    .map((n) => ({
      ...n,
      onPress: () => onNotificationPress?.(n.key),
      onDismiss: MUST_RESOLVE.has(n.key) ? undefined : () => setDismissed((d) => [...d, n.key]),
    }));
  // Address selection (anatomy 1): the strip opens the sheet; the chosen address drives the label.
  const [addressSheet, setAddressSheet] = useState(false);
  const [rebookSheet, setRebookSheet] = useState(false);
  // Props seed the strip; once the user picks in the sheet, that selection wins.
  const [addressKey, setAddressKey] = useState(
    HOME_ADDRESSES.find((a) => a.label === addressLabel)?.key ?? HOME_ADDRESSES[0].key,
  );
  const [country, setCountry] = useState('ae');
  const selectedAddress = HOME_ADDRESSES.find((a) => a.key === addressKey) ?? HOME_ADDRESSES[0];

  // The floating nav shrinks once the feed scrolls (same rule as every other screen).
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = e.nativeEvent.contentOffset.y > t.size['12'];
    setCompact((prev) => {
      if (prev === next) return prev;
      onNavCompactChange?.(next);
      return next;
    });
  };

  /**
   * ── The live app's scroll model, measured off `screenshots/scroll.mp4` (81 frames, pixel-probed) ──
   *
   * Three phases, one scroll:
   *  1. `s ∈ [0, HERO]` — the hero zone (live-activity card + dots) collapses: the white card rides up
   *     1:1 with the finger, address + search DO NOT move. (video: card 239→164, search fixed at 90)
   *  2. `s ∈ [HERO, HERO+ADDR]` — the address row folds away and the search slides up into its place;
   *     the card keeps riding up right under the search. (video: search 90→72, card 164→133)
   *  3. `s > HERO+ADDR` — the card **docks** and STAYS; its rounded top remains visible; the feed now
   *     scrolls INSIDE the card. (video: card top pinned at 133 for 2s of further scrolling)
   *
   * The hero gradient is ONE fixed full-screen layer behind everything (the video shows orange behind
   * the header in every frame — it never turns into a separate bar).
   *
   * Mechanics: one `Animated.ScrollView` inside a rounded, clipped card container. The container
   * translates up by `dock(s) = min(s, DOCK)` (so it rides 1:1, then pins); the scroller's inner
   * content translates DOWN by the same `dock(s)`, cancelling the container's motion so items always
   * move 1:1 with the finger — before the dock they're glued to the card, after it they slide within
   * it. NOTE (#38): this docked-card behaviour is deliberately NOT PageShell — no shell mode expresses
   * it; promote it into PageShell as a `dockedCard` mode at DS-reconciliation.
   */
  const ADDRESS_H = t.size['40'] + t.space.xs; // address strip + its gap — folds away in phase 2
  // Live-activity card + dots zone — collapses in phase 1. 92, not 120: the user asked for the hero
  // to lose 28. It hangs BELOW the search, so the address and search keep their coordinates; what
  // moves is the content card, which now rests 28 higher.
  const HERO_H = t.size['96'] - t.size['4'];
  const headerTopPad = safeAreaTop + t.space.xs;
  /** Search bar's resting bottom edge (expanded header). */
  const expandedHeaderBottom = headerTopPad + ADDRESS_H + t.size['40'] + t.space.sm;
  /** Where the card rests, and how far it travels before docking. */
  const cardRestTop = expandedHeaderBottom + HERO_H;
  const DOCK = HERO_H + ADDRESS_H;

  const scrollY = useRef(new Animated.Value(0)).current;
  const onScrollEvent = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false, // drives layout (heights) — JS driver, same as PageShell/BottomNavigation
    listener: onScroll,
  });
  const clamp = { extrapolate: 'clamp' as const };
  /** 0→DOCK: how far the card has ridden up (then pins). */
  const dock = scrollY.interpolate({ inputRange: [0, DOCK], outputRange: [0, -DOCK], ...clamp });
  const undock = scrollY.interpolate({ inputRange: [0, DOCK], outputRange: [0, DOCK], ...clamp });
  /** Phase 2 progress — folds the address row and fades it. */
  const addressH = scrollY.interpolate({ inputRange: [HERO_H, DOCK], outputRange: [ADDRESS_H, 0], ...clamp });
  const addressOpacity = scrollY.interpolate({ inputRange: [HERO_H, HERO_H + ADDRESS_H * 0.6], outputRange: [1, 0], ...clamp });
  /** Phase 1 — the hero zone fades as the card slides over it. */
  const heroOpacity = scrollY.interpolate({ inputRange: [0, HERO_H * 0.8], outputRange: [1, 0], ...clamp });

  const search = (
    <SearchBar
      value={query}
      onChangeText={setQuery}
      placeholder="Search for Home Cleaning"
      onSubmitEditing={() => onSearch?.(query)}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.background.canvas }}>
      {/* ONE fixed hero gradient behind everything — never splits, never scrolls. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <HomeHero />
      </View>

      {/* Hero zone (live activity + dots) — sits under the header; the card slides over it. */}
      <Animated.View
        pointerEvents="box-none"
        style={{ position: 'absolute', top: expandedHeaderBottom, left: 0, right: 0, height: HERO_H, opacity: heroOpacity }}
      >
        {/* The dots keep `space.xs` to the pager they belong to, and `space.sm` to the content card
            below — 4 read as stuck to the card's edge, 12 lifted them off the hero. */}
        <View
          style={{
            flex: 1,
            paddingHorizontal: t.space.md,
            paddingTop: t.space.xs,
            paddingBottom: t.space.sm,
            gap: t.space.xs,
            justifyContent: 'center',
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center' }} onLayout={(e) => setHeroWidth(e.nativeEvent.layout.width)}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const w = heroWidth || 1;
                setHeroPage(Math.round(e.nativeEvent.contentOffset.x / w));
              }}
            >
              <View style={{ width: heroWidth || undefined, justifyContent: 'center' }}>
                <LiveActivityCard name="Leila" window="09:30 - 10:00" />
              </View>
              <View style={{ width: heroWidth || undefined, justifyContent: 'center' }}>
                <BannerSlot label="Marketing hero banner (CRM image)" height={t.size['64']} />
              </View>
            </ScrollView>
          </View>
          <Dots count={2} active={heroPage} />
        </View>
      </Animated.View>

      {/* The card: rounded, clipped, shadowed — rides up with the scroll and DOCKS under the search.
          Its rounded top never leaves the screen (the video's docked frames keep it visible). */}
      <Animated.View
        style={{
          position: 'absolute',
          top: cardRestTop,
          left: 0,
          right: 0,
          // Extends past the screen by the full dock travel: the container translates up by up to
          // `DOCK`, and its bottom must still clear the screen edge in the docked state.
          bottom: -(t.size['24'] + DOCK),
          transform: [{ translateY: dock }],
          backgroundColor: t.background.canvas,
          borderTopLeftRadius: t.radius['2xl'],
          borderTopRightRadius: t.radius['2xl'],
          ...elevationToStyle({ color: 'rgba(26, 26, 26, 0.08)', offsetX: 0, offsetY: -2, blur: 24, spread: 0 }),
        }}
      >
        <View style={{ flex: 1, borderTopLeftRadius: t.radius['2xl'], borderTopRightRadius: t.radius['2xl'], overflow: 'hidden' }}>
          <Animated.ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onScrollEvent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={t.icon.brand} colors={[t.icon.brand]} />
            }
          >
            {/* Counter-shift: cancels the container's ride so items track the finger 1:1 in every phase. */}
            <Animated.View
              style={{ transform: [{ translateY: undock }], paddingTop: t.space.md, paddingBottom: bottom + t.size['120'] + DOCK }}
            >
              <VStack gap="lg">
                {refreshing || !artworkReady ? (
                  <FeedSkeleton m={m} />
                ) : (
                  <>
                    {/* 4 — notifications, as a deck: one live banner, the rest peeking behind it. */}
                    {notices.length ? (
                      <View style={{ marginHorizontal: t.space.md }}>
                        <NotificationStack items={notices} />
                      </View>
                    ) : null}

                    {/* 5 — service icons. */}
                    <ServiceIconGrid onSelect={(key) => onSelectService?.(key)} tileW={m.tileW} tileH={m.tileH} />

                    {/* 6 — Book Again. */}
                    <VStack gap="sm">
                      {/* "See all" opens the rebooking sheet — every past professional, filtered by
                          service. Hosts can take it over with `onSeeAllRebooking`. */}
                      <SectionHeader title="Book Again" onSeeAll={() => (onSeeAllRebooking ? onSeeAllRebooking() : setRebookSheet(true))} />
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.space.sm, paddingHorizontal: t.space.md }}>
                        {BOOK_AGAIN.map((pro) => (
                          <BookAgainCard key={pro.key} pro={pro} width={m.bookW} onPress={() => onRebook?.(pro.key)} />
                        ))}
                      </ScrollView>
                    </VStack>

                    {/* 7 — app banners: two fully visible, the third peeking (CRM images). */}
                    <VStack gap="sm">
                      <SectionHeader title="Top offers" />
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.space.sm, paddingHorizontal: t.space.md }}>
                        {/* Figma measures 160 × 191; we ship 160 × 200 (see FIGMA.offer). */}
                        {TOP_OFFERS.map((art, i) => (
                          <BannerSlot key={i} image={art} label={`Offer ${i + 1}`} width={m.offerW} height={m.offerH} />
                        ))}
                      </ScrollView>
                    </VStack>

                    {/* 8 — top picks (CRM images, tap opens video stories). */}
                    <VStack gap="sm">
                      <SectionHeader title="Top picks for you" />
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.space.sm, paddingHorizontal: t.space.md }}>
                        {/* Figma: 100 × 160. */}
                        {TOP_PICKS.map((art, i) => (
                          <BannerSlot key={i} image={art} label={`Top pick ${i + 1}`} width={m.pickW} height={m.pickH} />
                        ))}
                      </ScrollView>
                    </VStack>

                    {/* 9 — new banner area (promotional, full width). */}
                    <View style={{ paddingHorizontal: t.space.md }}>
                      {/* Fills the row → keeps the export's ratio at any width, so the artwork never crops. */}
                      <BannerSlot
                        image={middleBanner}
                        label="Save more with Credit Packages"
                        aspectRatio={PROMO_ASPECT}
                        artBleed={PROMO_BLEED}
                      />
                    </View>

                    {/* 10 — service tiles by vertical. */}
                    {TILE_SECTIONS.map((section) => (
                      <ServiceTileSection
                        key={section.key}
                        section={section}
                        tileW={m.serviceTileW}
                        tileH={m.serviceTileH}
                        onSelect={(label) => onSelectService?.(label)}
                      />
                    ))}
                  </>
                )}
              </VStack>
            </Animated.View>
          </Animated.ScrollView>
        </View>
      </Animated.View>

      {/* Pinned header — address (folds away in phase 2) + search (slides up into its place). Sits
          straight on the fixed hero gradient; no background of its own. */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: headerTopPad, paddingHorizontal: t.space.md }} pointerEvents="box-none">
        <Animated.View style={{ height: addressH, opacity: addressOpacity, overflow: 'hidden' }}>
          {/* 1 — address TITLE, alternating with the ETA (tap opens the saved-address sheet). */}
          <AddressStrip
            label={selectedAddress.label}
            detail={selectedAddress.area || addressDetail}
            eta={eta}
            onPress={() => {
              setAddressSheet(true);
              onAddressPress?.();
            }}
          />
        </Animated.View>
        {search}
      </View>

      {/* Address selection — stays mounted so every close path animates out. */}
      <HomeAddressSheet
        open={addressSheet}
        onClose={() => setAddressSheet(false)}
        value={addressKey}
        country={country}
        onSelect={(k) => {
          setAddressKey(k);
          setAddressSheet(false);
        }}
        onSelectCountry={setCountry}
      />

      {/* Book again — the "See all" destination, mounted so it animates both ways. */}
      <RebookingSheet
        open={rebookSheet}
        onClose={() => setRebookSheet(false)}
        onRebook={(key) => {
          setRebookSheet(false);
          onRebook?.(key);
        }}
      />

      {/* 11 — the floating nav (hosts pass showNav=false and hoist their own). */}
      {showNav ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
          <BottomNavigation items={NAV} activeKey={activeTab} onTabPress={onTabPress} compact={compact} safeAreaInset={bottom} />
        </View>
      ) : null}
    </View>
  );
}
