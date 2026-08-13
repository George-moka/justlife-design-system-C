import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, Platform, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface ConfettiProps {
  /** Number of confetti pieces. Default 28. */
  count?: number;
  /**
   * Where the burst emits from:
   * - `'bottom'` — pieces rise up the full screen (full-screen celebration).
   * - `'center'` — a small contained burst from the middle (e.g. inside a card).
   * - `'bottom-left'` / `'bottom-right'` — a corner burst: pieces launch from that bottom corner and fan
   *   up-and-inward (contained; e.g. a perfect-rating burst inside a card).
   * Default `'bottom'`.
   */
  origin?: 'bottom' | 'center' | 'bottom-left' | 'bottom-right';
  /** Flight duration (ms). Defaults to a relaxed rise + fade (`motion.duration.slow × 7`). */
  duration?: number;
  /** Bump this to (re)fire the burst — e.g. the applied voucher code, or a mount counter. */
  runKey?: string | number;
  /** Fired once the burst finishes. */
  onDone?: () => void;
  /** Override the piece colours (pass DS tokens). Defaults to a bright brand mix. */
  colors?: string[];
  style?: ViewStyle;
}

interface Piece {
  key: number;
  leftPct: number;
  w: number;
  h: number;
  radius: number;
  color: string;
  delay: number;
  driftFrac: number;
  spins: number;
}

/**
 * Lightweight, token-driven **confetti** burst. Pieces launch from the `origin`, rise/fan out with a gentle
 * spin, and fade — varied in **shape** (rectangles / squares / thin streamers), size and colour. Pure
 * `Animated` (transform + opacity → native-driver on device, JS on web), no native module, so it runs
 * identically in Storybook (RNW) and Expo Go. Distances come from `Dimensions` (no layout measurement, so it
 * fires immediately). `origin="bottom"` showers up the full screen; `'center'` is a small contained pop;
 * `'bottom-left'`/`'bottom-right'` launch from a corner. Decorative + `pointerEvents="none"`; clipped to its box.
 */
export function Confetti({ count = 28, origin = 'bottom', duration, runKey = 0, onDone, colors, style }: ConfettiProps) {
  const t = useTheme();
  const dur = duration ?? t.motion.duration.slow * 7;
  const palette = colors ?? [
    t.background.brandDefault,
    t.btn.secondary.bg,
    t.background.success,
    t.text.promoAccent,
    t.text.error,
    t.background.brandSubtle,
  ];
  const { width: winW, height: winH } = Dimensions.get('window');
  const corner = origin === 'bottom-left' || origin === 'bottom-right';
  const fromLeft = origin === 'bottom-left';
  const rise = origin === 'center' ? winH * 0.22 : corner ? winH * 0.28 : winH;
  const driftBasis = origin === 'center' ? winW * 0.22 : winW * 0.32;
  const anim = useRef(new Animated.Value(0)).current;

  // Pseudo-random pieces, regenerated whenever the burst (re)fires.
  const pieces = useMemo<Piece[]>(() => {
    const spread = origin === 'center' ? 24 : 50; // half-width % the pieces fan across (bottom / center)
    return Array.from({ length: count }).map((_, i) => {
      // Shape: mostly wide confetto rectangles, some squares, a few thin streamers/ribbons.
      const shape = Math.random();
      let w: number;
      let h: number;
      let radius: number;
      if (shape < 0.58) {
        w = t.size['8'] + Math.random() * t.size['6']; // 8–14
        h = t.size['4'] + Math.random() * t.size['2']; // 4–6
        radius = t.radius.sm;
      } else if (shape < 0.84) {
        const s = t.size['6'] + Math.random() * t.size['4']; // 6–10
        w = s;
        h = s;
        radius = t.radius.sm;
      } else {
        w = t.size['4'] - 1 + Math.random() * t.size['2']; // 3–5 (thin)
        h = t.size['12'] + Math.random() * t.size['6']; // 12–18 (long streamer)
        radius = t.radius.pill;
      }
      return {
        key: i,
        // Corners emit from a tight cluster hugging that bottom corner; bottom/center fan around the mid-line.
        leftPct: corner ? (fromLeft ? Math.random() * 8 : 100 - Math.random() * 8) : 50 + (Math.random() * 2 - 1) * spread,
        w,
        h,
        radius,
        color: palette[i % palette.length] as string,
        delay: Math.random() * 0.18,
        // Corners lean gently into the card interior (bottom-left → right, bottom-right → left); others fan both ways.
        driftFrac: corner ? (fromLeft ? 1 : -1) * (0.1 + Math.random() * 0.6) : Math.random() * 2 - 1,
        spins: 1 + Math.random() * 3,
      };
    });
    // Re-roll the pieces only when the burst (re)fires; palette/window are stable for a burst.
  }, [count, origin, runKey]);

  useEffect(() => {
    anim.setValue(0);
    const animation = Animated.timing(anim, {
      toValue: 1,
      duration: dur,
      easing: Easing.out(Easing.quad),
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start(({ finished }) => finished && onDone?.());
    return () => animation.stop();
  }, [runKey, dur]);

  return (
    <View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }, style]}>
      {pieces.map((p) => {
        const translateY = anim.interpolate({ inputRange: [0, p.delay, 1], outputRange: [0, 0, -rise], extrapolate: 'clamp' });
        const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.driftFrac * driftBasis] });
        const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${Math.round(p.spins * 360)}deg`] });
        const opacity = anim.interpolate({ inputRange: [0, p.delay, 0.82, 1], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' });
        return (
          <Animated.View
            key={`${runKey}-${p.key}`}
            style={{
              position: 'absolute',
              left: `${p.leftPct}%`,
              bottom: origin === 'bottom' || corner ? 0 : undefined,
              top: origin === 'center' ? '50%' : undefined,
              width: p.w,
              height: p.h,
              borderRadius: p.radius,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
