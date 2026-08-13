import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
  type View as ViewType,
  type ViewProps,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { ProgressiveBlur } from '../../primitives/ProgressiveBlur';
import { elevationToStyle, type ElevationToken } from '../../theme/style-helpers';
import type { Tokens } from '@justlife/tokens';

export interface PageShellProps extends Omit<ViewProps, 'children'> {
  /**
   * Renders the pinned header. Receives the live `collapsed` flag (driven by scroll) so it can
   * scroll-collapse — pass it straight to `<Header collapsed={collapsed} divider={false} … />`.
   */
  renderHeader: (collapsed: boolean) => React.ReactNode;
  /**
   * The band art behind the card (the `z −2` layer) — fills the band area, so pass a node that
   * stretches (e.g. `<RadialGlow style={{ flex: 1 }} … />` for the soft aurora, a `<LinearGradient>`,
   * a solid `<View>`, or a media/video node). Omit for no band (card on the page background).
   */
  band?: React.ReactNode;
  /** Expanded band height in px. Default 200. */
  bandHeight?: number;
  /**
   * **Docked-card scroll** — the model Home uses, and the right one whenever the band is *media* (a
   * hero video, a gradient) rather than a large title.
   *
   * The band is a **fixed layer**: it never scrolls. The content card rides up 1:1 with the finger
   * until its rounded top meets the header, then **docks** there and the content keeps scrolling
   * *inside* it. So the header never travels — it only collapses, together with the page.
   *
   * The default (off) is the large-title behaviour: the band scrolls away behind the pinned header,
   * which is right for a title band and wrong for media — media that slides off-screen reads as the
   * whole header scrolling.
   */
  dockedCard?: boolean;
  /**
   * Where the docked card comes to rest, in px from the top. Defaults to the measured header height.
   *
   * Pass it when the screen must line its chrome up with a sibling screen: the funnels share one chrome
   * height, and a pinned funnel's card sits at `bandHeight - overlap`, not at its header's height — so a
   * docked funnel has to be told that number or the two end up a few points apart.
   */
  dockTop?: number;
  /** Content laid over the band (e.g. a tagline). Fades out as the band collapses. */
  bandContent?: React.ReactNode;
  /**
   * Optional row that pins directly under the header once the band has collapsed (e.g. the salon
   * category-chips slider). Fades / slides in on collapse.
   */
  stickyRow?: React.ReactNode;
  /**
   * Backdrop that fades in WITH the sticky row and covers the pinned header + sticky-row zone (e.g.
   * `<ScreenAurora />`), so a collapsed flex funnel keeps the same pale band behind its chrome as the
   * pinned funnels — instead of dropping to a plain white bar. Rides the sticky row's animation.
   */
  collapsedBand?: React.ReactNode;
  /**
   * Floating bottom bar (the funnel's Total + Next/Complete `CheckoutBar`). Overlays the bottom of the
   * scroll area — content scrolls **behind** it — so pair it with {@link PageShellProps.footerInset}.
   */
  footer?: React.ReactNode;
  /** Bottom padding added inside the content card so the last items clear the floating `footer`. */
  footerInset?: number;
  /**
   * Top padding inside the content card, above the first item. Defaults to the band overlap so content
   * meets the band's bottom edge. Pass a smaller value (e.g. `space.md`) when the page's first item is a
   * **card**, so its top gap equals the page's left/right padding; keep the larger default when the first
   * item is **text**, which reads better with extra breathing room under the rounded card top.
   */
  contentInsetTop?: number;
  /** Page content, rendered inside the rounded-top content card. */
  children: React.ReactNode;
  /** Content-card top-corner radius. Default `radius.2xl` (24). */
  cardRadius?: number;
  /** How far the card overlaps up into the band (px). Default `size.24`. */
  overlap?: number;
  /** Height reserved for the pinned header (used to place the sticky row). Default `size.48`. */
  headerHeight?: number;
  /** Scroll offset (px) at which the header collapses. Default ≈ `bandHeight - overlap - headerHeight`. */
  collapseThreshold?: number;
  /**
   * Scroll offset (px) at which the **sticky row** slides in — decoupled from the header collapse so a
   * page whose own tabs/tiles live further down can hand over exactly when they leave (pass their
   * bottom edge). Defaults to {@link PageShellProps.collapseThreshold}.
   */
  stickyThreshold?: number;
  /** Fires when the collapsed state flips. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * Raw scroll listener for the content scroll area (fires in BOTH pinned and collapsing modes). Used by
   * screens to drive the floating nav's Instagram "shrink on scroll" — pinned screens have no other scroll
   * hook. Composed with the internal band-collapse listener in collapsing mode.
   */
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /**
   * **Pinned mode** (home-cleaning funnel): the header, band and rounded card are all **fixed** — only
   * the content *inside* the card scrolls. No band-collapse, no header collapse (`renderHeader` always
   * receives `false`). Leave `false` (default) for the flex-funnel collapsing behaviour.
   */
  pinned?: boolean;
  /**
   * Ref to the content `ScrollView` — lets a screen scroll programmatically (e.g. a category tab
   * jumping to its section). Works in both pinned and collapsing modes.
   */
  scrollViewRef?: React.Ref<ScrollView>;
  /**
   * Pull-to-refresh for the content scroller (pass RN's `<RefreshControl/>`). Lives on the shell so
   * every screen refreshes the same way — pinned screens included, where the content scroller is the
   * only thing that moves.
   */
  refreshControl?: React.ReactElement;
  /** Disable the content scroll (e.g. while a child owns a horizontal swipe gesture). Default `true`. */
  scrollEnabled?: boolean;
  /**
   * Make the scroll content fill the viewport height (pinned mode) so a trailing element can be pushed to
   * the bottom with a `flex:1` spacer — content still scrolls normally when it overflows. Default `false`.
   */
  contentGrow?: boolean;
  /**
   * Elevation of the rounded content card — controls the depth of the band ↔ card seam. Default
   * `raised` (a soft downward shadow); pass `sheet` for a deeper, **upward** seam shadow (the card
   * reading as lifted above the band).
   */
  cardElevation?: keyof Tokens['elevation'];
  /** Raw shadow override for the content card — takes precedence over `cardElevation` (e.g. a tuned soft seam shadow). */
  cardShadow?: ElevationToken;
}

/**
 * Layered "depth" page scaffold for the booking funnels. A soft-gradient (or media) **band sits
 * behind** a **rounded-top content card** that overlaps up into it — conceptually band `z −2`, card
 * `z 0`. The card scrolls over the band; the band fades + parallaxes away and, past a threshold, the
 * header scroll-collapses (via the `Header`'s own `collapsed` animation) and an optional sticky row
 * (category chips) pins under the header. Scroll is built in — pass a header, a band, and content and
 * it just works. Animated with the `motion` tokens. The band is a slot (`band`) — e.g. a `RadialGlow`
 * for the soft aurora, a solid colour, or a media node; a tagline/overlay goes in `bandContent`.
 */
export const PageShell = forwardRef<ViewType, PageShellProps>(function PageShell(
  {
    renderHeader,
    band,
    bandHeight = 200,
    bandContent,
    stickyRow,
    collapsedBand,
    footer,
    footerInset = 0,
    contentInsetTop,
    children,
    cardRadius,
    overlap,
    headerHeight,
    collapseThreshold,
    stickyThreshold,
    onCollapsedChange,
    onScroll,
    scrollViewRef,
    refreshControl,
    pinned = false,
    dockedCard = false,
    dockTop,
    scrollEnabled = true,
    contentGrow = false,
    cardElevation = 'raised',
    cardShadow,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const radius = cardRadius ?? t.radius['2xl'];
  const lap = overlap ?? t.size['24'];
  // MEASURED, not declared. Screens passed a guess (`safeAreaTop + size.48`) that was 22pt short of
  // the real bar, so the sticky row and the card's dock point both landed under the header. Any
  // change to the header's contents (a taller chip, a bigger title) silently broke it again.
  const [measuredHeaderH, setMeasuredHeaderH] = useState(0);
  const hHeight = measuredHeaderH || headerHeight || t.size['48'];
  const threshold = collapseThreshold ?? Math.max(t.size['16'], bandHeight - lap - hHeight);
  const stickyAt = stickyThreshold ?? threshold;
  // Card shadow: a raw override wins, else the named elevation token. Applied to the OUTER card layer
  // (the inner layer does the `overflow:'hidden'` clip) so iOS doesn't clip the shadow away.
  const cardShadowStyle = elevationToStyle(cardShadow ?? t.elevation[cardElevation]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [collapsed, setCollapsed] = useState(false);
  // The sticky row has its OWN trigger: the header must go solid as soon as the band leaves, but the
  // row waits until the page's own tabs/tiles have scrolled off (else both are on screen at once).
  const [stickyShown, setStickyShown] = useState(false);

  const bandScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false, // we read the value in JS to flip `collapsed`
    listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      setCollapsed((prev) => {
        // Hysteresis around the threshold so it doesn't flicker mid-scroll — but the release point can
        // never sit below the top of the page. Subtracting a whole header height from a threshold that
        // is SHORTER than the header put it at a negative offset, so once collapsed the header could
        // never expand again: the salon hero collapses at 53 and would have released at 53 − 118 = −65,
        // which no amount of scrolling back up can reach. The title stayed on the bar over the video.
        const release = Math.max(t.size['8'], threshold - hHeight);
        const next = prev ? y > release : y > threshold;
        if (next !== prev) onCollapsedChange?.(next);
        return next;
      });
      setStickyShown((prev) => (prev ? y > stickyAt - t.size['8'] : y > stickyAt));
      onScroll?.(e); // also feed the public listener (nav shrink) in collapsing mode
    },
  });

  // The sticky row SLIDES UP into place (and back down) on the collapse flip — a short, snappy
  // motion-token tween, not a scroll-linked cross-fade (which read as a plain "reveal"). Driven by the
  // boolean so the whole row animates as ONE object; reduce-motion snaps to the end state (#35).
  const [stickyH, setStickyH] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const stickyIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((r) => alive && setReduceMotion(r));
    return () => {
      alive = false;
    };
  }, []);
  const bandIn = useRef(new Animated.Value(0)).current;
  const tween = useCallback((v: Animated.Value, to: number) => {
    if (reduceMotion) {
      v.setValue(to);
      return;
    }
    Animated.timing(v, {
      toValue: to,
      duration: t.motion.duration.fast,
      easing: Easing.bezier(...(t.motion.easing.decelerate as [number, number, number, number])),
      useNativeDriver: false,
    }).start();
  }, [reduceMotion, t.motion.duration.fast, t.motion.easing.decelerate]);
  useEffect(() => {
    tween(stickyIn, stickyShown ? 1 : 0);
  }, [stickyShown, reduceMotion, tween, stickyIn]);
  useEffect(() => {
    tween(bandIn, collapsed ? 1 : 0);
  }, [collapsed, reduceMotion, tween, bandIn]);
  const stickyOpacity = stickyIn;
  // Enters from below its own height (measured) so the chips visibly travel UP into the bar.
  const stickyTranslate = stickyIn.interpolate({ inputRange: [0, 1], outputRange: [stickyH || t.size['40'], 0] });

  const hasBand = !!(band || bandContent);
  // Top padding above the first content item. Defaults to the overlap (content meets the band's bottom
  // edge); callers pass a smaller value for card-first pages so the top gap matches the side padding.
  const topInset = contentInsetTop ?? (hasBand ? lap : 0);

  // ── Pinned mode: header / band / card all fixed; only the content inside the card scrolls. ──
  if (pinned) {
    return (
      <View ref={ref} style={[{ flex: 1, backgroundColor: t.background.canvas }, style]} {...rest}>
        <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Band — fixed behind the header. */}
          {hasBand ? (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: bandHeight, zIndex: 0 }}>
              {band ? <View style={StyleSheet.absoluteFill}>{band}</View> : null}
              {bandContent ? <View style={StyleSheet.absoluteFill}>{bandContent}</View> : null}
            </View>
          ) : null}

          {/* Content card — FIXED; only the inner ScrollView scrolls. Two layers: the OUTER casts the
              shadow (rounded + bg, NO clip) and the INNER clips content to the rounded top — otherwise
              iOS `overflow:'hidden'` would clip the shadow away (it shows on web, not native). */}
          <View
            style={{
              position: 'absolute',
              top: hasBand ? bandHeight - lap : 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              backgroundColor: t.background.canvas,
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              ...cardShadowStyle,
            }}
          >
            <View style={{ flex: 1, borderTopLeftRadius: radius, borderTopRightRadius: radius, overflow: 'hidden' }}>
              <Animated.ScrollView
                ref={scrollViewRef as never}
                refreshControl={refreshControl}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingTop: topInset, paddingBottom: footerInset, ...(contentGrow ? { flexGrow: 1 } : null) }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled}
                scrollEventThrottle={16}
                onScroll={onScroll}
              >
                {children}
              </Animated.ScrollView>
            </View>
          </View>

          {/* Header — fixed on top (never collapses). */}
          <View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3 }}
            onLayout={(e) => setMeasuredHeaderH(Math.round(e.nativeEvent.layout.height))}
          >
            {renderHeader(false)}
          </View>

          {/* Footer — floating bottom overlay; inner content scrolls behind it. */}
          {footer ? (
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4, pointerEvents: 'box-none' }}>
              {footer}
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  // ── Docked-card mode: the band is a FIXED layer; the card rides up and DOCKS under the header. ──
  if (dockedCard) {
    const cardRestTop = hasBand ? bandHeight - lap : 0;
    // Where it stops. Defaults to the measured header height; a screen that has to match a sibling's
    // chrome passes that sibling's card top instead (see `dockTop`).
    const dockAt = dockTop ?? hHeight;
    const DOCK = Math.max(0, cardRestTop - dockAt);
    const span = Math.max(1, DOCK);
    const clamp = { extrapolate: 'clamp' as const };
    // The card rides up 1:1 with the finger and pins at DOCK; the scroller's inner content shifts DOWN
    // by the same amount, cancelling the ride so items always track the finger — glued to the card
    // before the dock, sliding within it after.
    const dockY = scrollY.interpolate({ inputRange: [0, span], outputRange: [0, -DOCK], ...clamp });
    const undockY = scrollY.interpolate({ inputRange: [0, span], outputRange: [0, DOCK], ...clamp });
    // Band content (a tagline, a carousel rail) fades as the card climbs over it.
    const bandFade = scrollY.interpolate({ inputRange: [0, span * 0.8], outputRange: [1, 0], ...clamp });
    // Its exact inverse, so the two band layers cross-fade with no see-through moment between them.
    const bandRise = scrollY.interpolate({ inputRange: [0, span * 0.8], outputRange: [0, 1], ...clamp });

    return (
      <View ref={ref} style={[{ flex: 1, backgroundColor: t.background.canvas }, style]} {...rest}>
        <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Band — FIXED behind everything. It never scrolls; the card covers it.
              It also CROSS-FADES to `collapsedBand` as the card climbs: once docked, the only band left
              on screen is the strip behind the chrome and the two notches inside the card's rounded
              corners. Live video in those notches reads as a rendering glitch — they need to settle to
              something calm, which is exactly what the docked state of Home shows (a flat gradient). */}
          {hasBand ? (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: bandHeight, zIndex: 0 }}>
              {band ? (
                <Animated.View style={[StyleSheet.absoluteFill, collapsedBand ? { opacity: bandFade } : null]}>
                  {band}
                </Animated.View>
              ) : null}
              {collapsedBand ? (
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: bandRise }]}>{collapsedBand}</Animated.View>
              ) : null}
              {bandContent ? (
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: bandFade }]}>{bandContent}</Animated.View>
              ) : null}
            </View>
          ) : null}

          {/* The card — rides up with the scroll, then docks. Two layers so iOS keeps the shadow: the
              outer carries bg + radius + shadow, the inner does the rounded clip. It extends past the
              screen bottom by the full dock travel, so nothing shows under it once docked. */}
          <Animated.View
            style={{
              position: 'absolute',
              top: cardRestTop,
              left: 0,
              right: 0,
              bottom: -DOCK,
              zIndex: 1,
              transform: [{ translateY: dockY }],
              backgroundColor: t.background.canvas,
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              ...cardShadowStyle,
            }}
          >
            <View style={{ flex: 1, borderTopLeftRadius: radius, borderTopRightRadius: radius, overflow: 'hidden' }}>
              <Animated.ScrollView
                ref={scrollViewRef as never}
                refreshControl={refreshControl}
                style={{ flex: 1 }}
                contentContainerStyle={contentGrow ? { flexGrow: 1 } : undefined}
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled}
                scrollEventThrottle={16}
                onScroll={bandScroll}
              >
                <Animated.View
                  style={{
                    transform: [{ translateY: undockY }],
                    paddingTop: topInset,
                    // Clears the floating footer AND the dock travel the container gave up.
                    paddingBottom: footerInset + DOCK,
                    ...(contentGrow ? { flexGrow: 1 } : null),
                  }}
                >
                  {children}
                </Animated.View>
              </Animated.ScrollView>
            </View>
          </Animated.View>

          {/* Sticky row — pins under the header once collapsed. The docked card's own rounded top is
              already there, so this only needs to carry the row itself. */}
          {/* Mounted only while shown, and animated by TRANSLATE alone: a glass surface must never sit
              under an animated opacity (expo-glass-effect #41024 — the material tears). */}
          {stickyRow && stickyShown ? (
            <Animated.View
              onLayout={(e) => setStickyH(e.nativeEvent.layout.height)}
              style={{
                // The card's docked top edge — the shortcuts belong to the card, not to the header.
                position: 'absolute',
                top: dockAt,
                left: 0,
                right: 0,
                zIndex: 3,
                borderTopLeftRadius: radius,
                borderTopRightRadius: radius,
              }}
            >
              {/* NO fill — a lens, not a material. The bar has no background of its own: what scrolls
                  underneath stays visible and is only blurred, and the blur itself is PROGRESSIVE —
                  strongest against the header, easing to nothing past the row's foot. A uniform blur
                  (or any tint) is still a plate laid over the page; this reads as depth. */}
              <ProgressiveBlur
                // The ramp runs a good way past the row so the falloff has room to be gradual —
                // ending it at the row's own edge is what makes a blur look 'cut off'.
                height={(stickyH || t.size['40']) + t.size['64']}
                topRadius={radius}
                style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
              />
              <View style={{ borderTopLeftRadius: radius, borderTopRightRadius: radius, overflow: 'hidden' }}>
                <Animated.View style={{ transform: [{ translateY: stickyTranslate }] }}>{stickyRow}</Animated.View>
              </View>
            </Animated.View>
          ) : null}

          {/* Header — pinned on top; it never travels, it only collapses. */}
          <View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 4 }}
            onLayout={(e) => setMeasuredHeaderH(Math.round(e.nativeEvent.layout.height))}
          >
            {renderHeader(collapsed)}
          </View>

          {/* Footer — floating bottom overlay; content scrolls behind it. */}
          {footer ? (
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 5, pointerEvents: 'box-none' }}>
              {footer}
            </View>
          ) : null}
        </View>
      </View>
    );
  }


  return (
    <View
      ref={ref}
      style={[{ flex: 1, backgroundColor: t.background.canvas }, style]}
      {...rest}
    >
      {/* Stage — the layered band + scrolling card + pinned header. Clips the band parallax. */}
      <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      {/* Scrolling content — the band scrolls away behind the pinned header; the rounded card
          overlaps up into it. */}
      <Animated.ScrollView
        ref={scrollViewRef as never}
        refreshControl={refreshControl}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        onScroll={bandScroll}
      >
        {band || bandContent ? (
          <View style={{ height: bandHeight }}>
            {band ? <View style={StyleSheet.absoluteFill}>{band}</View> : null}
            {bandContent ? <View style={StyleSheet.absoluteFill}>{bandContent}</View> : null}
          </View>
        ) : null}
        <View
          style={{
            flexGrow: 1,
            marginTop: band || bandContent ? -lap : 0,
            backgroundColor: t.background.canvas,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            paddingTop: topInset,
            paddingBottom: footerInset,
            ...cardShadowStyle,
          }}
        >
          {children}
        </View>
      </Animated.ScrollView>

      {/* Sticky row — pins under the header once collapsed. */}
      {/* Collapsed backdrop — fills the HEADER strip only (the blue band the pinned funnels show), so
          the chrome keeps the brand colour while the sticky row below stays on the content card. */}
      {collapsedBand ? (
        <Animated.View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: hHeight, zIndex: 1, opacity: bandIn, overflow: 'hidden' }}
        >
          {collapsedBand}
        </Animated.View>
      ) : null}

      {/* Card top — the content card's rounded edge would scroll off under the header, so it is PINNED
          here: canvas fill, the card's own corners and shadow, content passing behind it exactly as it
          would inside a docked card (#38). It rides the COLLAPSE, not the sticky row — a screen whose
          sticky row arrives much later (the salon funnel waits for its category grid to leave) or that
          has none at all would otherwise show a hard square edge for the whole gap in between. */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: hHeight,
          left: 0,
          right: 0,
          height: radius,
          zIndex: 1,
          opacity: bandIn,
          backgroundColor: t.background.canvas,
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          ...cardShadowStyle,
        }}
      />

      {/* Sticky row — pins under the header once collapsed. It IS the top of the content card while
          collapsed: canvas fill + the card's rounded top corners + the same shadow, so the rounded
          edge never disappears mid-scroll (#38). Clipped, so the row can slide up inside it. */}
      {stickyRow ? (
        <Animated.View
          onLayout={(e) => setStickyH(e.nativeEvent.layout.height)}
          style={{
            position: 'absolute',
            top: hHeight,
            left: 0,
            right: 0,
            zIndex: 2,
            opacity: stickyOpacity,
            backgroundColor: t.background.canvas,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            ...cardShadowStyle,
          }}
        >
          <View style={{ borderTopLeftRadius: radius, borderTopRightRadius: radius, overflow: 'hidden' }}>
            <Animated.View style={{ transform: [{ translateY: stickyTranslate }] }}>{stickyRow}</Animated.View>
          </View>
        </Animated.View>
      ) : null}

      {/* Header — pinned over the band (top layer). */}
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3 }}
        onLayout={(e) => setMeasuredHeaderH(Math.round(e.nativeEvent.layout.height))}
      >
        {renderHeader(collapsed)}
      </View>

      {/* Footer — floating bottom overlay; content scrolls behind it. */}
      {footer ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4, pointerEvents: 'box-none' }}>
          {footer}
        </View>
      ) : null}
      </View>
    </View>
  );
});
