import React, { forwardRef, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  View,
  type View as ViewType,
  type ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { elevationToStyle } from '../../theme/style-helpers';
import { hexToRgba } from '../../primitives/RadialGlow';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';
import type { Tokens } from '@justlife/tokens';

/** Tone → glyph colour for a trailing action / the back chevron. */
type HeaderTone = 'default' | 'danger' | 'brand';

export interface HeaderAction {
  /** Lucide icon name, e.g. "search" or "heart". */
  icon: string;
  onPress?: () => void;
  /** Accessible label — required, these are icon-only buttons. */
  accessibilityLabel: string;
  /** Glyph colour. `default`→icon.primary, `danger`→icon.error (e.g. a saved favourite), `brand`→icon.brand. */
  tone?: HeaderTone;
  /** Render the glyph filled (e.g. a saved/active favourite heart). */
  filled?: boolean;
}

export interface HeaderProps extends Omit<ViewProps, 'children'> {
  /** Screen title. */
  title: string;
  /**
   * Step progress — renders a slim N-segment progress bar under the title (the funnel
   * "Step {current} of {total}"). Hidden in the {@link HeaderProps.collapsed} state.
   */
  step?: { current: number; total: number };
  /** Show the leading back chevron (default `true`). */
  showBack?: boolean;
  onBack?: () => void;
  /**
   * Inline accessory on the **title row**, right-aligned **after** the action buttons (rightmost,
   * before any `flag`) — e.g. a compact step/progress indicator. Rendered as a slot so the artwork
   * (an SVG ring, a badge, …) stays out of the Header.
   */
  aside?: React.ReactNode;
  /** Trailing action buttons, left → right (e.g. a search and a favourite). */
  actions?: HeaderAction[];
  /**
   * Country / flag selector — any node rendered inside a circular hairline-bordered button
   * (Figma `Header` → "Show Country Selection"). Placed rightmost. The flag artwork itself is
   * a country asset, so it's passed in as a slot rather than baked into the component.
   */
  flag?: React.ReactNode;
  onFlagPress?: () => void;
  /**
   * Collapsed / compact state — hides the step progress bar and tightens the vertical padding.
   * Drive this from the screen's scroll position (scrolled → `true`). Animated with the
   * `motion` tokens, matching `BottomNavigation`'s shrink-on-scroll. Defaults to `false`.
   */
  collapsed?: boolean;
  /**
   * Bottom hairline divider (default `true`). Turn off when the header floats over media inside
   * a `PageShell` layered header. Ignored when {@link HeaderProps.overMedia} is set.
   */
  divider?: boolean;
  /**
   * Float over a `PageShell` media/aurora band: the bar is **transparent while expanded** (so the
   * band shows through) and **fades to the surface colour + hairline divider as it collapses** (so
   * scrolling content stays covered). Drive `collapsed` from the shell. Defaults to `false` (always
   * an opaque surface — standalone use on white screens).
   */
  overMedia?: boolean;
  /**
   * Status-bar / notch safe-area inset (px) added above the bar so the content clears the device
   * status bar, notch or Dynamic Island. Pass the device top inset (≈44–59 on iPhones). Default `0`.
   */
  safeAreaTop?: number;
  /** Title typography role. Default `titleMedium` (16) — compact but reads as the screen title. */
  titleVariant?: keyof Tokens['typography'];
}

function toneColour(t: ReturnType<typeof useTheme>, tone: HeaderTone = 'default'): string {
  if (tone === 'danger') return t.icon.error;
  if (tone === 'brand') return t.icon.brand;
  return t.icon.primary;
}

/**
 * Compact funnel header (Figma `Header`, node 12436:10918 — evolved to the redesigned, denser
 * homepage/funnel form). A single title row — leading back chevron, the screen title, and trailing
 * action icons + an optional country-flag selector — with an optional slim segmented step-progress
 * bar tucked under the title. Setting `collapsed` performs a scroll-collapse (the progress bar folds
 * away and the padding tightens) using the `motion` tokens; designed to sit at the top of a
 * `PageShell` layered header. Everything is tokenised, including the motion.
 */
export const Header = forwardRef<ViewType, HeaderProps>(function Header(
  {
    title,
    step,
    showBack = true,
    onBack,
    aside,
    actions,
    flag,
    onFlagPress,
    collapsed = false,
    divider = true,
    overMedia = false,
    safeAreaTop = 0,
    titleVariant = 'titleMedium',
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const hasStep = !!step && step.total > 1;

  // 0 = expanded (progress bar shown), 1 = collapsed. Animated with the motion tokens.
  const progress = useRef(new Animated.Value(collapsed ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: collapsed ? 1 : 0,
      duration: t.motion.duration.medium,
      easing: Easing.bezier(...t.motion.easing.standard),
      useNativeDriver: false, // animating layout height + opacity together
    }).start();
  }, [collapsed, progress, t]);

  const barRowHeight = t.size['4']; // the segments
  const barBlock = t.size['8'] + barRowHeight; // top gap + bar
  const barHeight = hasStep
    ? progress.interpolate({ inputRange: [0, 1], outputRange: [barBlock, 0] })
    : 0;
  const barOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  // Vertical padding eases down a touch on collapse so the bar genuinely slims. The top also
  // carries the status-bar / notch safe-area inset.
  const padBottom = progress.interpolate({ inputRange: [0, 1], outputRange: [t.size['10'], t.size['8']] });
  const padTop = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [t.size['10'] + safeAreaTop, t.size['8'] + safeAreaTop],
  });

  // Surface: opaque by default; over a media band it's transparent expanded → surface colour collapsed.
  const surfaceBg = overMedia
    ? progress.interpolate({
        inputRange: [0, 1],
        outputRange: [hexToRgba(t.background.primary, 0), hexToRgba(t.background.primary, 1)],
      })
    : t.background.primary;
  const borderBottomWidth = overMedia
    ? progress.interpolate({ inputRange: [0, 1], outputRange: [0, t.borderWidth.hairline] })
    : divider
      ? t.borderWidth.hairline
      : 0;

  // Align the progress bar's left edge under the title (past the back chevron).
  const titleInset = showBack ? t.size['24'] + t.size['8'] : 0;

  /**
   * Over a media band the icons sit on whatever the video happens to be showing, so each one rides its
   * own **white circular chip** (the shipped funnel's treatment) instead of trusting the footage to stay
   * dark. The chip fades out as the bar turns solid — by then the surface itself supplies the contrast.
   * The chip is a background only: the icon keeps its size and position, so nothing shifts on collapse.
   */
  const chipBg = overMedia
    ? progress.interpolate({
        inputRange: [0, 1],
        outputRange: [hexToRgba(t.background.primary, 1), hexToRgba(t.background.primary, 0)],
      })
    : undefined;

  const Chip = ({ children, size = t.size['32'] }: { children: React.ReactNode; size?: number }) =>
    overMedia ? (
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: t.radius.pill,
          backgroundColor: chipBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Animated.View>
    ) : (
      <>{children}</>
    );

  const renderAction = (a: HeaderAction, i: number) => {
    const colour = toneColour(t, a.tone);
    return (
      <Pressable
        key={`action-${i}`}
        onPress={a.onPress}
        accessibilityRole="button"
        accessibilityLabel={a.accessibilityLabel}
        hitSlop={t.size['8']}
        // Horizontal-only padding (touch area comes from hitSlop) so an action icon never makes the
        // bar taller than the title row — keeps the title at the same Y across all screens.
        style={({ pressed }) => ({ paddingHorizontal: t.size['4'], opacity: pressed ? 0.6 : 1 })}
      >
        <Chip>
          <Icon name={a.icon} size="lg" color={colour} fill={a.filled ? colour : 'none'} />
        </Chip>
      </Pressable>
    );
  };

  return (
    <Animated.View
      ref={ref}
      style={[
        {
          backgroundColor: surfaceBg,
          paddingHorizontal: t.space.md,
          paddingTop: padTop,
          paddingBottom: padBottom,
          borderBottomWidth,
          borderBottomColor: t.divider.color.default,
        },
        // A very subtle lift once the bar turns solid over a media band (keeps it readable while
        // content scrolls under it). No shadow while transparent/expanded.
        overMedia && collapsed ? elevationToStyle(t.elevation.raised) : null,
        style,
      ]}
      {...rest}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: t.size['24'] }}>
        {showBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={t.size['8']}
            style={({ pressed }) => ({ marginRight: t.size['8'], opacity: pressed ? 0.6 : 1 })}
          >
            <Chip>
              <Icon name="chevron-left" size="lg" color={t.icon.primary} />
            </Chip>
          </Pressable>
        ) : null}

        <Text variant={titleVariant} color="primary" numberOfLines={1} style={{ flex: 1 }}>
          {title}
        </Text>

        {actions?.map(renderAction)}

        {/* Inline accessory (e.g. the step ring) sits to the right of the actions. */}
        {aside !== undefined ? (
          // `size.4`, not `space.sm`: each action already carries `size.4` of its own horizontal
          // padding, so 4 here makes the gap before the aside identical to the gaps between them.
          <View style={{ marginLeft: t.size['4'] }}>
            {/* Same chip as the actions — an aside sitting bare on the footage next to two chipped
                icons is the one that looks broken. */}
            {/* Deliberately a size up from the action chips: the step counter is a STATUS readout,
                not a control, and matching their size made it read as a third button. */}
            <Chip size={t.size['40']}>{aside}</Chip>
          </View>
        ) : null}

        {flag !== undefined ? (
          <Pressable
            onPress={onFlagPress}
            disabled={!onFlagPress}
            accessibilityRole={onFlagPress ? 'button' : undefined}
            accessibilityLabel={onFlagPress ? 'Change country' : undefined}
            style={({ pressed }) => ({
              marginLeft: t.size['8'],
              width: t.size['32'],
              height: t.size['32'],
              borderRadius: t.radius.pill,
              borderWidth: t.borderWidth.hairline,
              borderColor: t.border.default,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              opacity: pressed && onFlagPress ? 0.6 : 1,
            })}
          >
            {flag}
          </Pressable>
        ) : null}
      </View>

      {hasStep ? (
        <Animated.View
          style={{
            height: barHeight,
            opacity: barOpacity,
            overflow: 'hidden',
            justifyContent: 'flex-end',
            marginLeft: titleInset,
          }}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: step!.total, now: step!.current }}
          accessibilityLabel={`Step ${step!.current} of ${step!.total}`}
        >
          <View style={{ flexDirection: 'row', height: barRowHeight, gap: t.size['4'] }}>
            {Array.from({ length: step!.total }).map((_, i) => (
              <View
                key={`seg-${i}`}
                style={{
                  flex: 1,
                  borderRadius: t.radius.pill,
                  backgroundColor: i < step!.current ? t.background.brandDefault : t.border.default,
                }}
              />
            ))}
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
});
