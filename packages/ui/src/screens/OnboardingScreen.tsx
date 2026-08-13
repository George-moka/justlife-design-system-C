import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  findNodeHandle,
  Keyboard,
  LayoutAnimation,
  PanResponder,
  Platform,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  UIManager,
  View,
  type TextInput as TextInputType,
} from 'react-native';
// InputAccessoryView is iOS-only and NOT exported by react-native-web — a named import would crash the
// Storybook (web) bundle. Pull it off the namespace (undefined on web) and only render it on iOS.
import * as ReactNative from 'react-native';
const InputAccessoryView = ReactNative.InputAccessoryView;
import Svg, { Line, Path, SvgXml } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { typographyToStyle } from '../theme/style-helpers';
import { Text, VStack, HStack, Icon, Button, RadialGlow, BottomSheet, SearchBar } from '../index';
import { hapticTap } from '../lib/haptics';
import { COUNTRIES, PINNED_COUNT, type Country } from '../data/countries.generated';

// Strip accents so search is ASCII-friendly: "tur" matches "Türkiye", "aland" matches "Åland Islands".
const foldDiacritics = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// LayoutAnimation needs an opt-in on (old-arch) Android; iOS/Fabric are fine, web is a no-op.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import otpVan from '../assets/otp_van.png';
// Onboarding hero icons — outer ring (4) + inner ring (3), exported individually from Figma so they can
// orbit (the flat cluster export baked in a white disc and couldn't animate).
import onbO1 from '../assets/onb_o1.png';
import onbO2 from '../assets/onb_o2.png';
import onbO3 from '../assets/onb_o3.png';
import onbO4 from '../assets/onb_o4.png';
import onbI1 from '../assets/onb_i1.png';
import onbI2 from '../assets/onb_i2.png';
import onbI3 from '../assets/onb_i3.png';

/* ------------------------------------------------------------------ *
 * Onboarding / OTP flow — rebuilt from Figma (file 5oelN…) to the DS.
 * A self-contained, clickable flow: Welcome → Enter phone → Verify OTP.
 * Faithful copy (verbatim from Figma); every visual value is a token.
 * Inline sub-pieces (logomark, van, OTP boxes, phone field) are kept
 * here for the design-in-context pass; we promote them to components
 * once the flow is approved.
 * ------------------------------------------------------------------ */

const DISPLAY_PHONE = '+971 58 523 5495';
const RESEND_SECONDS = 13;
const OTP_LENGTH = 4;
const DEMO_OTP = '1234'; // prototype only: the "correct" code; anything else → error state
const FAKE_REQUEST_MS = 700; // prototype only: simulate the send-code / verify-code network round-trip
// UAE mobile = 9 national digits starting with 5 (e.g. "50 123 45 67"); other countries get a loose
// 4–15 digit check (true per-country validation needs libphonenumber — flagged for later). Accepted
// formats + the error copy are placeholders — confirm with product/Figma.
const digitsOf = (raw: string) => raw.replace(/\D/g, '');
const isValidPhone = (iso2: string, raw: string) => {
  const d = digitsOf(raw);
  if (iso2 === 'AE') return /^5\d{8}$/.test(d);
  return d.length >= 4 && d.length <= 15;
};
const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.iso2 === 'AE') ?? COUNTRIES[0];
const VAN_W = 90;
const VAN_H = 44;
const VAN_DRIVE_MS = 5200; // ambient, longer than any motion token → a raw screen value
const ORBIT_OUTER_MS = 48000; // slow ambient orbit; raw screen values (beyond the motion scale)
const ORBIT_INNER_MS = 36000;
const ORBIT_FLICK_MIN = 0.06; // deg/ms — below this, a release just resumes the ambient orbit (no fling)
const ORBIT_FLICK_MAX = 2.4; // deg/ms — cap so a hard flick can't spin absurdly fast
const ORBIT_DECAY = 0.997; // fling friction (closer to 1 = coasts longer)
// "Done" bar above the numeric keypads (iOS phone-pad / number-pad have no return key to dismiss).
const KEYBOARD_ACCESSORY_ID = 'onboarding-keyboard-done';

// Hero icons placed on two concentric rings. Fractions are of the 440×440 Figma cluster: `r` = orbit
// radius, `s` = icon size, `angle` = degrees (0=right, 90=down). Lifted verbatim from the Figma node.
const HERO_RING = { outer: 440 / 440, inner: 240 / 440 } as const; // ring diameters as a fraction of width
const HERO_OUTER = [
  { src: onbO1, r: 218 / 440, s: 61 / 440, angle: -139 },
  { src: onbO2, r: 218 / 440, s: 58 / 440, angle: -66 },
  { src: onbO3, r: 218 / 440, s: 66 / 440, angle: 37 },
  { src: onbO4, r: 218 / 440, s: 70 / 440, angle: 140 },
];
const HERO_INNER = [
  { src: onbI1, r: 122 / 440, s: 70 / 440, angle: -151 },
  { src: onbI2, r: 122 / 440, s: 70 / 440, angle: 68 },
  { src: onbI3, r: 122 / 440, s: 56 / 440, angle: -18 },
];

// Enlarge a small text link's INVISIBLE touch area to the ~44px a11y minimum without affecting layout.
// (~13px label + md/md top-bottom ≈ 45px tall; sm left-right keeps adjacent links from overlapping.)
const linkHitSlop = (t: ReturnType<typeof useTheme>) => ({ top: t.space.md, bottom: t.space.md, left: t.space.sm, right: t.space.sm });

export type OnboardingStep = 'welcome' | 'phone' | 'verify';

export interface OnboardingScreenProps {
  /** Status-bar / notch inset. */
  safeAreaTop?: number;
  /** Home-indicator inset. */
  safeAreaBottom?: number;
  /** Which step to mount first (Storybook drives each state through this). */
  initialStep?: OnboardingStep;
  /** Phone number echoed on the verify screen. */
  phoneNumber?: string;
  /** OTP verified / "Continue" pressed on the last step. */
  onComplete?: () => void;
  /** "Skip" pressed (top-right, any step). */
  onSkip?: () => void;
  /** "I already have an account" pressed on the welcome screen. */
  onLogin?: () => void;
}

/* --- Justlife logomark (the cyan "d" mark, single path from Figma) --- */
function JustlifeLogomark({ height = 60, color }: { height?: number; color: string }) {
  const width = (47 / 60) * height;
  return (
    <Svg width={width} height={height} viewBox="0 0 47 60" fill="none">
      <Path
        d="M31.2645 33.9615C31.5683 34.7988 31.738 35.6831 31.7683 36.5883C31.7987 37.4945 31.6887 38.3872 31.4405 39.2433C30.9451 40.9566 29.8872 42.5101 28.4628 43.6179C27.0321 44.7308 25.3112 45.3499 23.4867 45.4105C21.6622 45.4711 19.9036 44.9657 18.4017 43.9509C16.9071 42.9403 15.7486 41.4609 15.1401 39.7831C14.8364 38.9458 14.6667 38.0615 14.6363 37.1552C14.606 36.249 14.7159 35.3563 14.9642 34.5002C15.4543 32.8068 16.4944 31.2668 17.8947 30.1633C21.0631 27.6638 21.5993 23.0784 19.0929 19.9201C16.5866 16.7619 11.9854 16.2263 8.81709 18.7257C4.98996 21.7441 2.2542 25.8012 0.907267 30.4598C0.232754 32.7869 -0.0678445 35.2018 0.0128039 37.6397C0.0934522 40.0765 0.5543 42.4673 1.38068 44.7454C3.03135 49.2933 6.15988 53.2983 10.1881 56.0211C12.7301 57.7396 15.0909 58.5958 16.4336 59.004C17.7167 59.3934 20.1194 60.001 23.2008 60C27.053 59.999 30.0014 59.0468 31.4363 58.5039C32.889 57.9537 35.1231 56.9347 37.4588 55.1191C41.2974 52.1352 44.1526 47.9319 45.4974 43.2859C46.1709 40.9587 46.4715 38.5428 46.3898 36.1049C46.3102 33.7245 45.8692 31.389 45.0785 29.1589L37.4996 5.10825C36.2878 1.26616 32.181 -0.871002 28.3266 0.338003C24.4723 1.54596 22.3293 5.63862 23.5412 9.48176L31.2656 33.9615H31.2645Z"
        fill={color}
      />
    </Svg>
  );
}

/* --- Circular flag — a 3×2 SVG (from country data) cropped to a circle, matching the Figma chip. --- */
function Flag({ xml, size }: { xml: string; size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <SvgXml xml={xml} width={size * 1.5} height={size} />
    </View>
  );
}

/* --- Searchable country picker in a DS BottomSheet. Memoised so the parent's per-second countdown
 *     re-renders don't rebuild the ~250-row list. --- */
const CountryPicker = React.memo(function CountryPicker({
  open,
  selectedIso,
  onSelect,
  onClose,
  reduceMotion,
}: {
  open: boolean;
  selectedIso: string;
  onSelect: (c: Country) => void;
  onClose: () => void;
  reduceMotion?: boolean;
}) {
  const t = useTheme();
  const [query, setQuery] = useState('');
  const unfiltered = query.trim() === '';

  // Smoothly animate the sheet resizing as results filter (content-driven height would otherwise snap).
  // Native only (no-op on web); gated by reduce-motion.
  const onSearch = (text: string) => {
    if (!reduceMotion) {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(t.motion.duration.medium, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity),
      );
    }
    setQuery(text);
  };
  const list = useMemo(() => {
    const q = foldDiacritics(query.trim());
    if (!q) return COUNTRIES;
    const qd = query.replace(/\D/g, '');
    // Fold diacritics so "tur" matches "Türkiye" (the data's common names carry accents).
    const matches = COUNTRIES.filter(
      (c) => foldDiacritics(c.name).includes(q) || c.iso2.toLowerCase().includes(q) || (qd && c.dial.includes(qd)),
    );
    // Rank name-prefix matches first ("india" → India before British Indian Ocean Territory); sort is
    // stable, so the pinned/alphabetical order holds within each group.
    return matches.slice().sort((a, b) => Number(foldDiacritics(b.name).startsWith(q)) - Number(foldDiacritics(a.name).startsWith(q)));
  }, [query]);

  return (
    <BottomSheet
      title="Select country"
      open={open}
      onClose={onClose}
      header={<SearchBar value={query} onChangeText={onSearch} placeholder="Search country or code" accessibilityLabel="Search countries" />}
    >
      {list.map((c, i) => {
        const selected = c.iso2 === selectedIso;
        return (
          <React.Fragment key={c.iso2}>
            <Pressable
              onPress={() => onSelect(c)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${c.name} ${c.dial}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md, minHeight: t.touchTarget.min }}
            >
              <Flag xml={c.flag} size={t.size['24']} />
              <Text variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>
                {c.name}
              </Text>
              <Text variant="bodyMedium" color="secondary">
                {c.dial}
              </Text>
              {selected ? <Icon name="check" size="sm" color={t.text.brand} /> : null}
            </Pressable>
            {/* Subtle divider between the pinned GCC group and the rest (only in the full, unsearched list). */}
            {unfiltered && i === PINNED_COUNT - 1 ? (
              <View style={{ height: t.borderWidth.hairline, backgroundColor: t.border.default }} />
            ) : null}
          </React.Fragment>
        );
      })}
    </BottomSheet>
  );
});

/* --- Welcome hero: two concentric rings of service icons orbiting the logomark.
 *     Auto-spins ambiently, but you can grab a ring and drag it round (then it resumes). --- */
function OrbitHero() {
  const t = useTheme();
  const [w, setW] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Rotation of each ring, in DEGREES (signed; can grow past 360 — the interpolation extends linearly).
  const rotOuter = useRef(new Animated.Value(0)).current;
  const rotInner = useRef(new Animated.Value(0)).current;

  // Mutable mirrors the once-created PanResponder + recursive spinner read live each gesture.
  const geom = useRef({ w: 0 });
  const liveVal = useRef({ outer: 0, inner: 0 }); // JS mirror of each rotation for synchronous reads
  const spinning = useRef({ outer: true, inner: true });
  const reduceRef = useRef(false);
  const spinRef = useRef<(key: 'outer' | 'inner') => void>(() => {});
  // `prevDeg`/`prevT` feed a running angular velocity (deg/ms) used to fling the ring on release.
  const drag = useRef<{
    ring: 'outer' | 'inner' | null;
    startAngle: number;
    base: number;
    gx: number;
    gy: number;
    prevDeg: number;
    prevT: number;
    vel: number;
  }>({ ring: null, startAngle: 0, base: 0, gx: 0, gy: 0, prevDeg: 0, prevT: 0, vel: 0 });

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((r) => alive && setReduceMotion(r));
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    reduceRef.current = reduceMotion;
  }, [reduceMotion]);

  // Mirror each rotation into plain JS so a drag can read the exact current angle synchronously.
  useEffect(() => {
    const io = rotOuter.addListener(({ value }) => (liveVal.current.outer = value));
    const ii = rotInner.addListener(({ value }) => (liveVal.current.inner = value));
    return () => {
      rotOuter.removeListener(io);
      rotInner.removeListener(ii);
    };
  }, [rotOuter, rotInner]);

  // Continuous, resumable auto-spin: a recursive timing that always animates +360° from the CURRENT value,
  // so it can be paused for a drag and resumed from anywhere with no jump. JS-driven (a drag needs setValue).
  useEffect(() => {
    const start = (key: 'outer' | 'inner') => {
      if (reduceRef.current) return;
      const val = key === 'outer' ? rotOuter : rotInner;
      const dur = key === 'outer' ? ORBIT_OUTER_MS : ORBIT_INNER_MS;
      const dir = key === 'outer' ? 1 : -1;
      spinning.current[key] = true;
      val.stopAnimation((cur) => {
        if (!spinning.current[key]) return;
        Animated.timing(val, { toValue: cur + 360 * dir, duration: dur, easing: Easing.linear, useNativeDriver: false }).start(
          ({ finished }) => {
            if (finished && spinning.current[key]) start(key);
          },
        );
      });
    };
    spinRef.current = start;
    if (!reduceMotion && w > 0) {
      start('outer');
      start('inner');
    }
    return () => {
      spinning.current.outer = false;
      spinning.current.inner = false;
      rotOuter.stopAnimation();
      rotInner.stopAnimation();
    };
  }, [reduceMotion, w, rotOuter, rotInner]);

  // On release, fling the ring with whatever angular velocity the finger had, then let friction (decay)
  // bleed it off and hand back to the ambient spin — so a fast flick really whips round before settling.
  const endDrag = () => {
    const d = drag.current;
    const ring = d.ring;
    d.ring = null;
    if (!ring) return;
    const val = ring === 'outer' ? rotOuter : rotInner;
    const vel = Math.max(-ORBIT_FLICK_MAX, Math.min(ORBIT_FLICK_MAX, d.vel));
    if (Math.abs(vel) > ORBIT_FLICK_MIN) {
      Animated.decay(val, { velocity: vel, deceleration: ORBIT_DECAY, useNativeDriver: false }).start(({ finished }) => {
        if (finished) spinRef.current(ring); // friction has stopped it → resume the gentle ambient orbit
      });
    } else {
      spinRef.current(ring);
    }
  };

  // Grab the nearest ring (by touch radius) and rotate it to follow the finger; fling it on release.
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
      onPanResponderGrant: (e) => {
        const W = geom.current.w;
        if (!W) return;
        const cx = W / 2;
        const lx = e.nativeEvent.locationX;
        const ly = e.nativeEvent.locationY;
        const radius = Math.hypot(lx - cx, ly - cx);
        const ring: 'outer' | 'inner' = radius > W * 0.39 ? 'outer' : 'inner';
        spinning.current[ring] = false;
        (ring === 'outer' ? rotOuter : rotInner).stopAnimation();
        const base = liveVal.current[ring];
        drag.current = { ring, startAngle: Math.atan2(ly - cx, lx - cx), base, gx: lx, gy: ly, prevDeg: base, prevT: Date.now(), vel: 0 };
      },
      onPanResponderMove: (_e, g) => {
        const d = drag.current;
        if (!d.ring) return;
        const cx = geom.current.w / 2;
        const ang = Math.atan2(d.gy + g.dy - cx, d.gx + g.dx - cx);
        const deg = d.base + ((ang - d.startAngle) * 180) / Math.PI;
        const now = Date.now();
        const dt = now - d.prevT;
        if (dt > 0) {
          d.vel = (deg - d.prevDeg) / dt; // deg/ms
          d.prevDeg = deg;
          d.prevT = now;
        }
        (d.ring === 'outer' ? rotOuter : rotInner).setValue(deg);
      },
      onPanResponderRelease: endDrag,
      onPanResponderTerminate: endDrag,
    }),
  ).current;

  // A faint orbit guide ring (very low-opacity ink — a raw value; tokens have no translucent ink ramp).
  const ring = (dF: number) =>
    ({
      position: 'absolute',
      width: w * dF,
      height: w * dF,
      borderRadius: (w * dF) / 2,
      top: w / 2 - (w * dF) / 2,
      left: w / 2 - (w * dF) / 2,
      borderWidth: t.borderWidth.thin,
      borderColor: 'rgba(26, 26, 26, 0.06)',
    }) as const;

  // A rotating layer carrying its icons; each icon counter-rotates so it stays upright while it orbits.
  const orbit = (icons: typeof HERO_OUTER, val: Animated.Value) => {
    const rot = val.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
    const counter = val.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '-360deg'] });
    return (
      <Animated.View pointerEvents="none" style={{ position: 'absolute', width: w, height: w, transform: [{ rotate: rot }] }}>
        {icons.map((ic, i) => {
          const size = w * ic.s;
          const R = w * ic.r;
          const rad = (ic.angle * Math.PI) / 180;
          return (
            <Animated.Image
              key={i}
              source={ic.src}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
              style={{
                position: 'absolute',
                width: size,
                height: size,
                left: w / 2 + R * Math.cos(rad) - size / 2,
                top: w / 2 + R * Math.sin(rad) - size / 2,
                transform: [{ rotate: counter }],
              }}
            />
          );
        })}
      </Animated.View>
    );
  };

  return (
    <View
      {...pan.panHandlers}
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        geom.current.w = width;
        setW(width);
      }}
      style={{ width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      {w > 0 ? (
        <>
          <View pointerEvents="none" style={ring(HERO_RING.outer)} />
          <View pointerEvents="none" style={ring(HERO_RING.inner)} />
          {orbit(HERO_OUTER, rotOuter)}
          {orbit(HERO_INNER, rotInner)}
          <View pointerEvents="none">
            <JustlifeLogomark height={w * 0.16} color={t.background.brandDefault} />
          </View>
        </>
      ) : null}
    </View>
  );
}

/* --- "Done" bar above the numeric keypad (iOS), so the keyboard can be dismissed to reach Continue --- */
function DoneAccessory() {
  const t = useTheme();
  if (Platform.OS !== 'ios') return null;
  return (
    <InputAccessoryView nativeID={KEYBOARD_ACCESSORY_ID}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          backgroundColor: t.background.tertiary,
          paddingHorizontal: t.space.md,
          paddingVertical: t.space.sm,
          borderTopWidth: t.borderWidth.thin,
          borderColor: t.border.default,
        }}
      >
        <Pressable onPress={Keyboard.dismiss} hitSlop={linkHitSlop(t)} accessibilityRole="button">
          <Text variant="labelMedium" style={{ color: t.text.link }}>
            Done
          </Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

/* --- The signature delight: a top-down Justlife van driving a dashed road --- */
function OtpVan() {
  const t = useTheme();
  const [roadW, setRoadW] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((r) => alive && setReduceMotion(r));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || roadW === 0) return;
    // Drive from the left edge fully off the right, then loop. The reset happens off-screen, so the van
    // simply "arrives → drives off → a new one arrives" with no visible jump. Position only (no opacity
    // trick) so it's also visible at rest — incl. in the headless preview, which can't tick rAF.
    x.setValue(0);
    const loop = Animated.loop(
      Animated.timing(x, {
        toValue: roadW,
        duration: VAN_DRIVE_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, roadW, x]);

  // A lane the van drives in: solid top + bottom edge lines with a dashed centre line (Figma: w1 edges,
  // w2 centre, dashes [12,10]). The van is taller than the lane, so it rides over it. Container height is a
  // size token; the van keeps its intrinsic 90×44 (asset ratio) and is centred within it.
  const laneH = t.size['24'];
  const roadH = t.size['48'];
  return (
    <View
      onLayout={(e) => setRoadW(e.nativeEvent.layout.width)}
      style={{ width: '100%', height: roadH, justifyContent: 'center' }}
    >
      {roadW > 0 ? (
        <Svg width={roadW} height={laneH} style={{ position: 'absolute', top: (roadH - laneH) / 2 }}>
          <Line x1={0} y1={t.borderWidth.thin} x2={roadW} y2={t.borderWidth.thin} stroke={t.border.default} strokeWidth={t.borderWidth.thin} />
          <Line
            x1={0}
            y1={laneH / 2}
            x2={roadW * 0.95}
            y2={laneH / 2}
            stroke={t.border.default}
            strokeWidth={t.borderWidth.thick}
            strokeDasharray="12 10"
          />
          <Line x1={0} y1={laneH - t.borderWidth.thin} x2={roadW} y2={laneH - t.borderWidth.thin} stroke={t.border.default} strokeWidth={t.borderWidth.thin} />
        </Svg>
      ) : null}
      <Animated.Image
        source={otpVan}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        style={{
          position: 'absolute',
          width: VAN_W,
          height: VAN_H,
          top: (roadH - VAN_H) / 2,
          transform: [{ translateX: x }],
        }}
      />
    </View>
  );
}

/* --- 4-box OTP entry: one hidden input, four rendered boxes. Tints + shakes on error;
 *     announces its fill progress to the screen reader. --- */
function OtpBoxes({
  value,
  onChange,
  length = OTP_LENGTH,
  autoFocus,
  error,
  disabled,
  reduceMotion,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  autoFocus?: boolean;
  error?: boolean;
  disabled?: boolean;
  reduceMotion?: boolean;
}) {
  const t = useTheme();
  const ref = useRef<TextInputType>(null);
  const [focused, setFocused] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;

  // On a fresh error, shake the row (gated by reduce-motion → the tint + message alone signal it).
  useEffect(() => {
    if (!error) return;
    if (reduceMotion) return;
    shake.setValue(0);
    Animated.sequence(
      [8, -8, 6, -6, 0].map((to) =>
        Animated.timing(shake, { toValue: to, duration: 50, easing: Easing.linear, useNativeDriver: true }),
      ),
    ).start();
  }, [error, reduceMotion, shake]);

  return (
    <Animated.View
      accessibilityRole="none"
      style={{ alignSelf: 'center', transform: [{ translateX: shake }] }}
    >
      <Pressable
        onPress={() => ref.current?.focus()}
        disabled={disabled}
        style={{ flexDirection: 'row', gap: t.space.sm }}
        importantForAccessibility="no-hide-descendants"
      >
        {Array.from({ length }).map((_, i) => {
          const char = value[i] ?? '';
          const filled = char !== '';
          const active = focused && i === value.length;
          const borderColor = error
            ? t.input.border.error
            : filled
              ? t.border.brandDefault
              : active
                ? t.border.strong
                : t.input.border.default;
          return (
            <View
              key={i}
              style={{
                width: t.size['56'],
                height: t.size['64'],
                borderRadius: t.radius.control,
                borderWidth: t.borderWidth.thin,
                borderColor,
                backgroundColor: t.input.bg.default,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="headlineSmall" style={{ color: error ? t.text.error : t.text.primary }}>
                {char}
              </Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(txt) => onChange(txt.replace(/[^0-9]/g, '').slice(0, length))}
        editable={!disabled}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel="One-time passcode"
        accessibilityValue={{ text: `${value.length} of ${length} digits entered` }}
        inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_ACCESSORY_ID : undefined}
        style={{ position: 'absolute', width: t.size['1'], height: t.size['1'], opacity: 0 }}
      />
    </Animated.View>
  );
}

/* --- Country chip + number field. Styled to match the DS `Input` (radius.control, 0.5 border, input.*
 *     tokens, focus highlight, bodyMedium) so it's consistent with every other field in the app. --- */
function PhoneField({
  value,
  onChange,
  onSubmitEditing,
  error,
  country,
  onPressCountry,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmitEditing?: () => void;
  error?: string;
  country: Country;
  onPressCountry: () => void;
}) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  // Country code + typed number share ONE style: same family + size as the DS Input (bodyMedium), no
  // lineHeight (it offsets the input vertically on iOS), font-scaling off on both so they can't diverge.
  const base = typographyToStyle(t.typography.bodyMedium);
  const fieldType = { fontFamily: base.fontFamily, fontSize: base.fontSize, fontWeight: base.fontWeight, letterSpacing: base.letterSpacing };
  const borderColor = error ? t.input.border.error : focused ? t.input.border.active : t.input.border.default;
  return (
    <View style={{ width: '100%', gap: t.space.xs }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          minHeight: t.touchTarget.min,
          borderRadius: t.radius.control,
          borderWidth: t.borderWidth.default,
          borderColor,
          backgroundColor: t.input.bg.default,
          paddingHorizontal: t.space.md,
          gap: t.space.sm,
        }}
      >
        <Pressable
          onPress={onPressCountry}
          style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.xs }}
          accessibilityRole="button"
          accessibilityLabel={`Country code, ${country.name} ${country.dial}. Tap to change.`}
        >
          <Flag xml={country.flag} size={t.size['20']} />
          <Text style={[fieldType, { color: t.text.primary }]} allowFontScaling={false}>
            {country.dial}
          </Text>
          <Icon name="chevron-down" size="sm" color={t.icon.primary} />
        </Pressable>
        <TextInput
          value={value}
          onChangeText={(txt) => onChange(txt.replace(/[^0-9 ]/g, ''))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          keyboardType="phone-pad"
          placeholder="50 123 45 67"
          placeholderTextColor={t.input.placeholder.color}
          accessibilityLabel="Phone number"
          {...({ 'aria-invalid': Boolean(error) } as Record<string, unknown>)}
          allowFontScaling={false}
          inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_ACCESSORY_ID : undefined}
          style={[
            fieldType,
            { flex: 1, alignSelf: 'stretch', color: t.text.primary, paddingVertical: t.space.sm, textAlignVertical: 'center', includeFontPadding: false },
          ]}
        />
      </View>
      {error ? (
        <Text variant="bodyXSmall" style={{ color: t.text.error }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/* --- Top-right Skip link, shared across steps --- */
function SkipLink({ onPress, top }: { onPress?: () => void; top: number }) {
  const t = useTheme();
  return (
    <View style={{ paddingTop: top + t.space.sm, alignItems: 'flex-end' }}>
      <Pressable onPress={onPress} hitSlop={linkHitSlop(t)} accessibilityRole="button">
        <Text variant="labelMedium" style={{ color: t.text.link }}>
          Skip
        </Text>
      </Pressable>
    </View>
  );
}

/* --- Fade-in wrapper to mimic the prototype's dissolve between steps --- */
function FadeIn({ stepKey, reduceMotion, children }: { stepKey: string; reduceMotion?: boolean; children: React.ReactNode }) {
  const t = useTheme();
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) {
      op.setValue(1); // reduce-motion: show instantly, no dissolve
      return;
    }
    op.setValue(0);
    Animated.timing(op, {
      toValue: 1,
      duration: t.motion.duration.slow,
      easing: Easing.bezier(...t.motion.easing.decelerate),
      useNativeDriver: true,
    }).start();
  }, [stepKey, reduceMotion, op, t.motion.duration.slow, t.motion.easing.decelerate]);
  return <Animated.View style={{ flex: 1, opacity: op }}>{children}</Animated.View>;
}

const mmss = (s: number) => `00:${String(Math.max(0, s)).padStart(2, '0')}`;

export function OnboardingScreen({
  safeAreaTop = 0,
  safeAreaBottom = 0,
  initialStep = 'welcome',
  phoneNumber = DISPLAY_PHONE,
  onComplete,
  onSkip,
  onLogin,
}: OnboardingScreenProps) {
  const t = useTheme();
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [sentVia, setSentVia] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [submitting, setSubmitting] = useState(false); // a send/verify request is in flight
  const [codeError, setCodeError] = useState(false); // last OTP attempt was wrong
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [pickerOpen, setPickerOpen] = useState(false);
  const headingRef = useRef<React.ElementRef<typeof Text>>(null);

  // Stable handlers so the memoised CountryPicker doesn't rebuild its ~250-row list on every parent render.
  const closePicker = useCallback(() => setPickerOpen(false), []);
  const selectCountry = useCallback((c: Country) => {
    setCountry(c);
    setPhoneError(null);
    setPickerOpen(false);
  }, []);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((r) => alive && setReduceMotion(r));
    return () => {
      alive = false;
    };
  }, []);

  // The bottom CTA is absolutely anchored, so its distance from the bottom is identical on every step.
  // Resting inset = the home-indicator inset (same as the floating navbar / checkout bar). When the keyboard
  // shows it SLIDES up to a small, constant gap above the keyboard — synced to the keyboard's own animation.
  const restInset = safeAreaBottom;
  const keyboardGap = t.space.md;
  const ctaBottom = useRef(new Animated.Value(restInset)).current;
  useEffect(() => {
    const moveTo = (toValue: number, e: { duration?: number }) => {
      if (reduceMotion) {
        ctaBottom.setValue(toValue); // reduce-motion: snap, don't slide
        return;
      }
      Animated.timing(ctaBottom, {
        toValue,
        duration: e.duration || t.motion.duration.medium,
        easing: Easing.bezier(...t.motion.easing.decelerate),
        useNativeDriver: false,
      }).start();
    };
    const onShow = (e: { endCoordinates: { height: number }; duration?: number }) => moveTo(e.endCoordinates.height + keyboardGap, e);
    const onHide = (e: { duration?: number }) => moveTo(restInset, e);
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', onShow);
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', onHide);
    return () => {
      show.remove();
      hide.remove();
    };
  }, [ctaBottom, restInset, keyboardGap, reduceMotion, t.motion.duration.medium, t.motion.easing.decelerate]);

  // Countdown — runs only on the verify step while there's time left.
  useEffect(() => {
    if (step !== 'verify' || seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [step, seconds]);

  // Move screen-reader focus to the new step's heading once the dissolve settles, so the step is announced.
  useEffect(() => {
    const node = headingRef.current && findNodeHandle(headingRef.current);
    if (!node) return;
    const id = setTimeout(() => AccessibilityInfo.setAccessibilityFocus(node), reduceMotion ? 0 : t.motion.duration.slow);
    return () => clearTimeout(id);
  }, [step, reduceMotion, t.motion.duration.slow]);

  // Prototype: simulate the send-code / verify-code network round-trip. Swap for a real callback later.
  const fakeRequest = () => new Promise<void>((resolve) => setTimeout(resolve, FAKE_REQUEST_MS));

  // Phone step → validate, "send" the code (loading), advance to verify.
  const submitPhone = async () => {
    if (submitting) return;
    if (!isValidPhone(country.iso2, phone)) {
      // placeholder copy — confirm with product/Figma
      setPhoneError(country.iso2 === 'AE' ? 'Enter a valid UAE mobile number' : 'Enter a valid mobile number');
      return;
    }
    setPhoneError(null);
    setSubmitting(true);
    await fakeRequest();
    setSubmitting(false);
    setCode('');
    setCodeError(false);
    setSentVia(null);
    setSeconds(RESEND_SECONDS);
    setStep('verify');
  };

  // Verify step → check the code (loading). Auto-fires on the 4th digit; Continue is a fallback.
  const verify = async (entered: string) => {
    if (submitting) return;
    Keyboard.dismiss();
    setSubmitting(true);
    await fakeRequest();
    setSubmitting(false);
    if (entered === DEMO_OTP) {
      onComplete?.();
    } else {
      setCodeError(true);
      hapticTap();
    }
  };

  // OTP edit: clear a prior error on the first keystroke, then auto-submit once all digits are in.
  const onCodeChange = (next: string) => {
    if (codeError) setCodeError(false);
    setCode(next);
    if (next.length === OTP_LENGTH) verify(next);
  };

  const resend = (channel: string) => {
    setSentVia(channel);
    setSeconds(RESEND_SECONDS);
    setCode('');
    setCodeError(false);
  };

  const screen = { flex: 1, backgroundColor: t.background.primary } as const;
  const pad = { paddingHorizontal: t.space.lg } as const;
  // The verify screen echoes what the user actually entered (dial + number); falls back to the prop default.
  const displayNumber = phone.trim() ? `${country.dial} ${phone.trim()}` : phoneNumber;

  /* ----------------------------- WELCOME ----------------------------- */
  if (step === 'welcome') {
    return (
      <View style={screen}>
        <RadialGlow
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          baseColor={t.background.primary}
          glows={[{ color: t.background.brandDefault, x: '50%', y: '32%', opacity: 0.16, radius: '62%' }]}
        />
        <FadeIn stepKey="welcome" reduceMotion={reduceMotion}>
          <View style={[{ flex: 1 }, pad]}>
            <SkipLink onPress={onSkip} top={safeAreaTop} />

            {/* Hero: two rings of service icons orbiting the logomark. Breaks out of the page padding so
                the rings bleed to the screen edges, faithful to Figma (cluster is wider than the frame). */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: -t.space.lg, overflow: 'hidden' }}>
              <OrbitHero />
            </View>

            {/* Promise copy */}
            <VStack gap="sm" style={{ alignItems: 'center' }}>
              <Text ref={headingRef} variant="headlineLarge" align="center" style={{ color: t.text.promoDark }}>
                We got you
              </Text>
              <Text variant="bodyBase" align="center" style={{ color: t.text.promoDark, maxWidth: t.size['200'] + t.size['80'] }}>
                From home cleaning to maintenance stuff, we are here to serve you, anytime.
              </Text>
            </VStack>

            {/* CTAs */}
            <VStack gap="md" style={{ alignItems: 'center', paddingTop: t.space.xl, paddingBottom: safeAreaBottom + t.space.lg }}>
              <View style={{ width: t.size['200'] + t.size['20'], alignSelf: 'center' }}>
                <Button variant="secondary" shape="pill" fullWidth onPress={() => setStep('phone')}>
                  Get Started
                </Button>
              </View>
              <Pressable onPress={onLogin} hitSlop={linkHitSlop(t)} accessibilityRole="button">
                <Text variant="labelMedium" style={{ color: t.text.link }}>
                  I already have an account
                </Text>
              </Pressable>
            </VStack>
          </View>
        </FadeIn>
      </View>
    );
  }

  /* --------------------------- ENTER PHONE --------------------------- */
  if (step === 'phone') {
    return (
      <View style={screen}>
        <FadeIn stepKey="phone" reduceMotion={reduceMotion}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[{ flex: 1 }, pad]}>
              <SkipLink onPress={onSkip} top={safeAreaTop} />
              <VStack gap="sm" style={{ alignItems: 'center', paddingTop: t.space.lg }}>
                <Text ref={headingRef} variant="headlineSmall" align="center" style={{ color: t.text.promoDark }}>
                  Enter your{'\n'}phone number
                </Text>
                <Text variant="bodyBase" align="center" style={{ color: t.text.promoDark }}>
                  So we can send you a message containing a code.
                </Text>
              </VStack>

              <View style={{ paddingTop: t.size['48'] }}>
                <PhoneField
                  value={phone}
                  onChange={(v) => {
                    if (phoneError) setPhoneError(null);
                    setPhone(v);
                  }}
                  onSubmitEditing={submitPhone}
                  error={phoneError ?? undefined}
                  country={country}
                  onPressCountry={() => {
                    Keyboard.dismiss();
                    setPickerOpen(true);
                  }}
                />
              </View>

              <Animated.View style={{ position: 'absolute', left: 0, right: 0, bottom: ctaBottom, alignItems: 'center' }}>
                <View style={{ width: t.size['200'] + t.size['20'] }}>
                  <Button
                    variant="secondary"
                    shape="pill"
                    fullWidth
                    loading={submitting}
                    disabled={submitting || phone.trim().length === 0}
                    onPress={submitPhone}
                  >
                    Continue
                  </Button>
                </View>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </FadeIn>
        <DoneAccessory />
        <CountryPicker open={pickerOpen} selectedIso={country.iso2} onSelect={selectCountry} onClose={closePicker} reduceMotion={reduceMotion} />
      </View>
    );
  }

  /* ---------------------------- VERIFY OTP --------------------------- */
  const expired = seconds <= 0;
  return (
    <View style={screen}>
      <FadeIn stepKey="verify" reduceMotion={reduceMotion}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[{ flex: 1 }, pad]}>
          <SkipLink onPress={onSkip} top={safeAreaTop} />

          <VStack gap="xs" style={{ alignItems: 'center', paddingTop: t.space.lg }}>
            <Text ref={headingRef} variant="headlineSmall" align="center" style={{ color: t.text.promoDark }}>
              An OTP is{'\n'}on the way!
            </Text>
            <Pressable onPress={() => setStep('phone')} hitSlop={linkHitSlop(t)} accessibilityRole="button" accessibilityLabel={`Edit number ${displayNumber}`}>
              <Text variant="bodyBase" align="center" style={{ color: expired ? t.text.link : t.text.promoDark }}>
                to {displayNumber}
              </Text>
            </Pressable>
          </VStack>

          <View style={{ paddingTop: t.space.xl, paddingBottom: t.space.lg }}>
            <OtpVan />
          </View>

          <OtpBoxes
            value={code}
            onChange={onCodeChange}
            error={codeError}
            disabled={submitting}
            reduceMotion={reduceMotion}
            autoFocus
          />

          {/* Wrong-code error line — announced via the live region below. Copy is a placeholder; confirm w/ product. */}
          {codeError ? (
            <Text variant="bodyXSmall" align="center" style={{ color: t.text.error, paddingTop: t.space.sm }}>
              Incorrect code. Please try again.
            </Text>
          ) : null}

          {/* Resend status: countdown → options; with the "sent via" confirmation. Live region so a screen
              reader announces the "Sent via …" / resend-available transitions. */}
          <VStack gap="xs" style={{ alignItems: 'center', paddingTop: t.space.md }} accessibilityLiveRegion="polite">

            {expired ? (
              <>
                <Text variant="bodyBase" style={{ color: t.text.secondary }}>
                  Resend code via:
                </Text>
                <HStack gap="lg">
                  <Pressable onPress={() => resend('Whatsapp')} hitSlop={linkHitSlop(t)} accessibilityRole="button" accessibilityLabel="Resend code via WhatsApp">
                    <Text variant="labelMedium" style={{ color: t.text.link }}>
                      Whatsapp
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => resend('SMS')} hitSlop={linkHitSlop(t)} accessibilityRole="button" accessibilityLabel="Resend code via SMS">
                    <Text variant="labelMedium" style={{ color: t.text.link }}>
                      SMS
                    </Text>
                  </Pressable>
                </HStack>
              </>
            ) : (
              <Text variant="bodyBase" style={{ color: t.text.secondary }}>
                Resend code in: <Text variant="labelMedium" style={{ color: t.text.primary }}>{mmss(seconds)}</Text>
              </Text>
            )}
            {sentVia && !expired ? (
              <HStack gap="xs" style={{ alignItems: 'center' }}>
                <Text variant="bodyBase" style={{ color: t.text.success }}>
                  Sent via {sentVia}
                </Text>
                <Icon name="square-check-big" size="sm" color={t.text.success} />
              </HStack>
            ) : null}
          </VStack>

          <Animated.View style={{ position: 'absolute', left: 0, right: 0, bottom: ctaBottom, alignItems: 'center' }}>
            <View style={{ width: t.size['200'] + t.size['20'] }}>
              <Button
                variant="secondary"
                shape="pill"
                fullWidth
                loading={submitting}
                disabled={submitting || code.length < OTP_LENGTH || codeError}
                onPress={() => verify(code)}
              >
                Continue
              </Button>
            </View>
          </Animated.View>
        </View>
        </TouchableWithoutFeedback>
      </FadeIn>
      <DoneAccessory />
    </View>
  );
}
