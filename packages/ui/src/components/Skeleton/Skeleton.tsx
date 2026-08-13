import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  View,
  type DimensionValue,
  type ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { LinearGradient } from '../../primitives/LinearGradient';
import { hexToRgba } from '../../primitives/RadialGlow';

/**
 * Shared shimmer clock. A `SkeletonGroup` runs ONE loop and shares its `progress` (0 → 1) so every
 * `Skeleton` inside sweeps in unison (a single cohesive wave, not N drifting ones) and signals
 * reduce-motion once. A lone `Skeleton` with no group runs its own loop.
 */
const SkeletonClock = createContext<{ progress: Animated.Value | null; reduceMotion: boolean }>({
  progress: null,
  reduceMotion: false,
});

/** Detect (and live-track) the OS "reduce motion" setting. */
function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => alive && setReduce(!!v));
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => setReduce(!!v));
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);
  return reduce;
}

/** A continuous left → right shimmer loop (the research-backed "wave" — perceived faster than a pulse). */
function useShimmerLoop(duration: number, enabled: boolean): Animated.Value {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) return;
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [duration, enabled, progress]);
  return progress;
}

export interface SkeletonProps extends Omit<ViewProps, 'children'> {
  /** Box width — number (px) or `'100%'`. Default `'100%'`. */
  width?: DimensionValue;
  /** Box height (px). Default `16` (one text line). */
  height?: number;
  /** Corner radius. Defaults to `radius.sm`; ignored when `circle`. */
  radius?: number;
  /** Render a circle (avatar/icon placeholder) — radius becomes `height / 2`. */
  circle?: boolean;
  /** Turn the shimmer off (renders a static block). Default `true`. */
  animated?: boolean;
}

/**
 * **Skeleton** — a single shimmering placeholder block. Mirror the real content's **size + radius** so the
 * swap is seamless (no layout shift). Compose them to match the actual layout (avatar circle + title line +
 * shorter last line), or use `SkeletonText`. Wrap a set in `SkeletonGroup` so they sweep in unison and the
 * region announces "Loading".
 *
 * The shimmer is a translucent highlight that sweeps **left → right** (the wave that reads as faster than a
 * pulse), driven on the native driver; it respects **reduce motion** (renders static) and is decorative to
 * screen readers (the `SkeletonGroup` carries the busy state).
 */
export function Skeleton({ width = '100%', height = 12, radius, circle, animated = true, style, ...rest }: SkeletonProps) {
  const t = useTheme();
  const group = useContext(SkeletonClock);
  const ownReduceMotion = useReduceMotion();
  const reduceMotion = group.reduceMotion || ownReduceMotion;

  // A slow, steady sweep (≈1.3s) — long enough to feel calm, short enough to feel alive. Token-derived.
  const duration = t.motion.duration.slow * 4;
  const standalone = !group.progress;
  const localProgress = useShimmerLoop(duration, standalone && animated && !reduceMotion);
  const progress = group.progress ?? localProgress;

  const [boxW, setBoxW] = useState(0);
  const r = circle ? height / 2 : (radius ?? t.radius.sm);
  const showSweep = animated && !reduceMotion && boxW > 0;

  // Sweep a box-wide highlight from fully off-left to fully off-right, then a brief rest off-screen before it
  // repeats (the gap gives the classic shimmer rhythm rather than a relentless strobe).
  const translateX = progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [-boxW, boxW, boxW] });
  // A soft fill — neutral.300 (#DDDDDD) at 60% reads ≈ #EBEBEB on a white card: visible but not heavy
  // (the ramp jumps straight to #F5F5F5, which is too faint here). The sweep is a gentle lift toward white.
  const fill = hexToRgba(t.border.default, t.opacity['60']);
  const clear = hexToRgba(t.background.surface, 0); // transparent white
  const sheen = hexToRgba(t.background.surface, t.opacity['60']); // the bright band

  return (
    <View
      // Decorative — the SkeletonGroup announces the busy/loading state for the whole region.
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(e) => {
        const w = Math.round(e.nativeEvent.layout.width);
        if (w && w !== boxW) setBoxW(w);
      }}
      style={[{ width, height, borderRadius: r, backgroundColor: fill, overflow: 'hidden' }, style]}
      {...rest}
    >
      {showSweep ? (
        <Animated.View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: boxW, transform: [{ translateX }] }}>
          <LinearGradient horizontal colors={[clear, sheen, clear]} style={{ flex: 1 }} />
        </Animated.View>
      ) : null}
    </View>
  );
}

export interface SkeletonTextProps {
  /** Number of lines. Default `3`. */
  lines?: number;
  /** Line height (px). Default `10`. */
  lineHeight?: number;
  /** Gap between lines. Defaults to `space.xs`. */
  gap?: number;
  /** Width of the full lines. Default `'100%'`. */
  width?: DimensionValue;
  /** Width of the LAST line (paragraphs end short). Default `'60%'`. Ignored when `lines` is 1. */
  lastLineWidth?: DimensionValue;
}

/** **SkeletonText** — a paragraph placeholder: N lines, the last one short (as real text wraps). */
export function SkeletonText({ lines = 3, lineHeight = 10, gap, width = '100%', lastLineWidth = '60%' }: SkeletonTextProps) {
  const t = useTheme();
  return (
    <View style={{ gap: gap ?? t.space.sm }}>
      {Array.from({ length: lines }).map((_, i) => (
        // Text ghosts use the smallest real radius (`sm`) — nothing in the UI is pill unless the real
        // element is, so the placeholder shouldn't be either.
        <Skeleton key={i} height={lineHeight} radius={t.radius.sm} width={lines > 1 && i === lines - 1 ? lastLineWidth : width} />
      ))}
    </View>
  );
}

export interface SkeletonGroupProps extends ViewProps {
  children: React.ReactNode;
  /** Screen-reader announcement for the loading region. Default `"Loading"`. */
  label?: string;
}

/**
 * **SkeletonGroup** — wrap a set of `Skeleton`s so they (1) share one shimmer clock (sweep in unison) and
 * (2) expose a single busy/`progressbar` region to assistive tech instead of N silent boxes.
 */
export function SkeletonGroup({ children, label = 'Loading', style, ...rest }: SkeletonGroupProps) {
  const t = useTheme();
  const reduceMotion = useReduceMotion();
  const progress = useShimmerLoop(t.motion.duration.slow * 4, !reduceMotion);
  return (
    <SkeletonClock.Provider value={{ progress, reduceMotion }}>
      {/* One busy/`progressbar` region for the whole set (RNW maps these to role/aria-busy/aria-label),
          so assistive tech announces "Loading" once — not per placeholder. */}
      <View
        accessibilityRole="progressbar"
        accessibilityState={{ busy: true }}
        accessibilityLabel={label}
        style={style}
        {...rest}
      >
        {children}
      </View>
    </SkeletonClock.Provider>
  );
}
