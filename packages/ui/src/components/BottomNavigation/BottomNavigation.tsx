import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type View as ViewType,
  type ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';
import { GlassSurface } from '../../primitives/GlassSurface';

/** Above this count the badge collapses to "N+". */
const BADGE_MAX = 9;

/**
 * Expanded/compact pill width as a fraction of the available row width, derived from
 * Instagram's measured floating nav (screen 630w → expanded 564w, compact 474w). The compact
 * pill is ~84% of the expanded one — a gentle shrink, not a collapse.
 */
const EXPANDED_WIDTH_RATIO = 564 / 630; // 0.8952  → 5.24% side margin
const COMPACT_WIDTH_RATIO = 474 / 630; //  0.7524 → 12.38% side margin

export interface BottomNavItem {
  /** Stable identifier, matched against `activeKey`. */
  key: string;
  /** Caption under the icon (collapses in the compact state). */
  label: string;
  /** Lucide icon name (e.g. "house", "calendar-check", "wallet", "user"). */
  icon: string;
  /**
   * Notification badge. A number renders a count pill ("9+" above {@link BADGE_MAX});
   * `true` renders a plain dot. `0`/`false`/omitted → no badge.
   */
  badge?: number | boolean;
}

export interface BottomNavigationProps extends Omit<ViewProps, 'children'> {
  /** Tabs, left → right. Designed for 3–5 items. */
  items: BottomNavItem[];
  /** `key` of the active tab. */
  activeKey: string;
  onTabPress?: (key: string) => void;
  /**
   * Collapse to the slim icon-only state (Instagram-style "shrink on scroll"). The bar shrinks
   * ~16% in both dimensions — height `size.56`→`size.48`, width `EXPANDED_WIDTH_RATIO`→
   * `COMPACT_WIDTH_RATIO` of the row, centred — and the labels collapse to icon-only. Matches
   * Instagram's measured proportions. Animated with the `motion` tokens. Drive this from the
   * screen's scroll position (scrolled → `true`, at top → `false`). Defaults to `false`.
   */
  compact?: boolean;
  /**
   * `true` (default) → floating rounded pill bar with a soft shadow (Figma "Navigation Bar").
   * `false` → full-width bar docked to the screen bottom with a hairline top divider (this layout
   * only shrinks vertically, not in width).
   */
  floating?: boolean;
  /**
   * Space reserved below the bar to clear the device home indicator (iOS). The floating pill sits
   * this far above the screen edge (like Instagram); the docked bar pads its content up by it.
   * Defaults to `safeArea.bottom` (34px). Pass `0` for an isolated showcase or when the host frame
   * already insets the bottom.
   */
  safeAreaInset?: number;
}

/**
 * Bottom navigation bar (Figma "Navigation Bar", evolved to the Instagram-style floating
 * pattern). A row of icon + label tabs; the active tab gets a tinted pill highlight
 * (`tabbar.bg.active`), the brand icon colour (`tabbar.icon.active`) and a semibold label.
 * Items carry an optional notification badge (count pill or dot). Setting `compact` performs
 * Instagram's gentle "shrink on scroll" — the floating pill loses ~16% of its width and height
 * (proportions taken from a measured IG nav) and the labels collapse to icons. Everything is
 * tokenised, including the motion.
 */
export const BottomNavigation = forwardRef<ViewType, BottomNavigationProps>(
  function BottomNavigation(
    { items, activeKey, onTabPress, compact = false, floating = true, safeAreaInset, style, ...rest },
    ref,
  ) {
    const t = useTheme();
    const bottomInset = safeAreaInset ?? t.safeArea.bottom;
    const count = items.length;
    const activeIndex = Math.max(0, items.findIndex((i) => i.key === activeKey));

    // Reduce-motion gates the shrink + pill slide — snap to the end-state instead of tweening (AGENTS #35/#36).
    const [reduceMotion, setReduceMotion] = useState(false);
    useEffect(() => {
      let alive = true;
      AccessibilityInfo.isReduceMotionEnabled().then((r) => alive && setReduceMotion(r));
      const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
      return () => {
        alive = false;
        sub?.remove?.();
      };
    }, []);

    // 0 = full (icon + label, wide), 1 = compact (icon only, narrow). Animated with motion tokens.
    const progress = useRef(new Animated.Value(compact ? 1 : 0)).current;
    useEffect(() => {
      if (reduceMotion) {
        progress.setValue(compact ? 1 : 0);
        return;
      }
      Animated.timing(progress, {
        toValue: compact ? 1 : 0,
        duration: t.motion.duration.medium,
        easing: Easing.bezier(...t.motion.easing.standard),
        useNativeDriver: false, // animating layout (width/height) + opacity together
      }).start();
    }, [compact, progress, reduceMotion, t]);

    // Highlight pill position (0…count-1) — slides to the active tab when it changes.
    const slide = useRef(new Animated.Value(activeIndex)).current;
    useEffect(() => {
      if (reduceMotion) {
        slide.setValue(activeIndex);
        return;
      }
      Animated.timing(slide, {
        toValue: activeIndex,
        duration: t.motion.duration.medium,
        easing: Easing.bezier(...t.motion.easing.standard),
        useNativeDriver: false, // animating the spacer width (a %) — RNW tweens it per frame so the pill glides
      }).start();
    }, [activeIndex, slide, reduceMotion, t]);

    const gap = t.size['2'];
    const pillInset = t.size['6']; // equal margin around the highlight pill (top/bottom/sides)
    const labelBlock = gap + t.typography.bodyMicro.lineHeight; // gap + line-height

    // The bar height is driven explicitly so the shrink stays gentle (≈16%) even though a whole
    // label row collapses — at compact the icon simply re-centres in the shorter bar.
    const barHeight = progress.interpolate({ inputRange: [0, 1], outputRange: [t.size['56'], t.size['48']] });
    const labelHeight = progress.interpolate({ inputRange: [0, 1], outputRange: [labelBlock, 0] });
    const labelOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

    // Width as a % of the row (no measuring needed) — the outer wrapper centres the pill.
    const widthStyle = floating
      ? {
          width: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [`${EXPANDED_WIDTH_RATIO * 100}%`, `${COMPACT_WIDTH_RATIO * 100}%`],
          }),
        }
      : null;

    // The sliding highlight: an animated-width spacer pushes a one-tab-wide pill from the left. RNW tweens the
    // `width` % per frame so it glides; it's all %-based (no measuring) so it auto-tracks the compact width.
    // The pill FILLS its tab cell (no negative margin), so it can never poke past the bar's rounded ends — the
    // edge tabs (Home / Profile) sit cleanly inside the bar. Memoised so the interpolation node survives
    // active-tab re-renders (a fresh node would interrupt the slide).
    const spacerWidth = useMemo(
      () =>
        count > 1
          ? slide.interpolate({ inputRange: [0, count - 1], outputRange: ['0%', `${((count - 1) / count) * 100}%`] })
          : ('0%' as const),
      [slide, count],
    );
    // Inset by the bar's horizontal padding so the highlight's coordinate space matches the tab row (RN
    // absolute ignores the parent's padding, so we mirror it). Keeps the pill aligned under each icon and
    // gives the edge tabs breathing room from the rounded ends.
    const highlight = (
      <View style={{ position: 'absolute', top: 0, left: t.size['8'], right: t.size['8'], bottom: 0, flexDirection: 'row', pointerEvents: 'none' }}>
        <Animated.View style={{ width: spacerWidth }} />
        <View style={{ width: `${100 / count}%`, paddingVertical: pillInset }}>
          <View style={{ flex: 1, borderRadius: t.radius.pill, backgroundColor: t.tabbar.bg.active }} />
        </View>
      </View>
    );

    // Inset the tab row from the bar's rounded ends so the edge tabs' (Home / Profile) pills aren't flush
    // against the curve. The highlight overlay is absolute → positioned in this same padded content box, so
    // it stays aligned with the tabs and the pill keeps its full per-cell width.
    const pillBase = {
      flexDirection: 'row' as const,
      alignItems: 'stretch' as const,
      paddingHorizontal: t.size['8'],
    };

    const tabs = items.map((item) => {
      const active = item.key === activeKey;
      const hasCount = typeof item.badge === 'number' && item.badge > 0;
      const hasDot = item.badge === true;
      const a11yBadge = hasCount
        ? `, ${item.badge} notifications`
        : hasDot
          ? ', has notifications'
          : '';

      return (
        <Pressable
          key={item.key}
          accessibilityRole="button"
          accessibilityLabel={`${item.label}${a11yBadge}`}
          accessibilityState={{ selected: active }}
          onPress={() => onTabPress?.(item.key)}
          style={({ pressed }) => [
            {
              flex: 1,
              paddingHorizontal: t.size['8'],
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <View>
            <Icon
              name={item.icon}
              size="lg"
              color={active ? t.tabbar.icon.active : t.tabbar.icon.default}
            />
            {hasCount ? (
              <View
                style={{
                  position: 'absolute',
                  top: -t.size['6'],
                  right: -t.size['8'],
                  minWidth: t.size['16'],
                  height: t.size['16'],
                  paddingHorizontal: t.size['4'],
                  borderRadius: t.radius.pill,
                  backgroundColor: t.badge.bg.danger,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="labelXXSmall" color="onError">
                  {(item.badge as number) > BADGE_MAX ? `${BADGE_MAX}+` : String(item.badge)}
                </Text>
              </View>
            ) : null}
            {hasDot ? (
              <View
                style={{
                  position: 'absolute',
                  top: -t.size['1'],
                  right: -t.size['1'],
                  width: t.size['8'],
                  height: t.size['8'],
                  borderRadius: t.radius.pill,
                  backgroundColor: t.badge.bg.danger,
                }}
              />
            ) : null}
          </View>
          <Animated.View
            style={{ height: labelHeight, opacity: labelOpacity, overflow: 'hidden', alignSelf: 'stretch', alignItems: 'center' }}
          >
            <Text
              variant={active ? 'labelXXSmall' : 'bodyMicro'}
              color={active ? 'primary' : 'secondary'}
              numberOfLines={1}
              style={{ marginTop: gap }}
            >
              {item.label}
            </Text>
          </Animated.View>
        </Pressable>
      );
    });

    // Docked: full-width, attached to the bottom edge; shrinks vertically only.
    if (!floating) {
      return (
        <Animated.View
          ref={ref}
          style={[
            pillBase,
            {
              height: barHeight,
              width: '100%',
              backgroundColor: t.background.primary,
              borderTopWidth: t.borderWidth.hairline,
              borderTopColor: t.divider.color.default,
              paddingBottom: t.size['2'] + bottomInset,
            },
            style,
          ]}
          {...rest}
        >
          {highlight}
          {tabs}
        </Animated.View>
      );
    }

    // Floating: an outer full-width row centres the pill so it can narrow toward the middle.
    // The home-indicator inset sits below the pill so it floats clear of the screen edge.
    return (
      <View ref={ref} style={{ alignSelf: 'stretch', alignItems: 'center', paddingBottom: bottomInset }} {...rest}>
        <Animated.View
          style={[pillBase, { height: barHeight, borderRadius: t.radius.pill }, widthStyle, style]}
        >
          {/* Liquid-glass backing: real blur + tint + edge + sheen, carrying the pill's shadow. */}
          <GlassSurface radius={t.radius.pill} style={StyleSheet.absoluteFill} />
          {highlight}
          {tabs}
        </Animated.View>
      </View>
    );
  },
);
