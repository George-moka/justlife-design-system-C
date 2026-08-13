import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, useWindowDimensions, View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { elevationToStyle } from '../../theme/style-helpers';
import { GlassSurface } from '../../primitives/GlassSurface';
import { Collapsible } from '../../primitives/Collapsible';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { PriceDetails, type PriceDetailsRow } from '../PriceDetails';

export interface CheckoutBarSummary {
  /** Panel heading. Default "Payment Summary". */
  title?: string;
  /** Optional content shown at the **top** of the expanded panel — e.g. a card listing the booked
   *  service(s). Useful for flex funnels where several services are booked at once. */
  header?: React.ReactNode;
  /** Breakdown line items. */
  rows: PriceDetailsRow[];
  /** Total row. */
  total: PriceDetailsRow;
}

export interface CheckoutBarProps extends Omit<ViewProps, 'children'> {
  /** Current total, pre-formatted (e.g. "AED 62.10"). */
  total: string;
  /** Strikethrough original total (e.g. "AED 399.00"). */
  oldTotal?: string;
  /** Label before the total. Default "Total". */
  totalLabel?: string;
  /** Primary CTA label (e.g. "Next" / "Complete"). */
  cta: string;
  onCtaPress?: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  /** When provided the bar is **expandable** — a chevron reveals this price summary above the bar. */
  summary?: CheckoutBarSummary;
  /** Controlled expanded state. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Space reserved below the floating bar so it clears the device home indicator (iOS) — the bar
   * sits this far above the screen edge, matching Instagram. Defaults to `safeArea.bottom` (34px);
   * pass `0` when the host already insets the bottom (e.g. a device frame with its own safe area).
   */
  safeAreaBottom?: number;
  /**
   * When `false`, the bar shows **no price** and the CTA fills the whole width (e.g. a funnel step before
   * the price exists). Flipping it to `true` **morphs**: the CTA squeezes to the right while the total
   * reveals on the left. Default `true`. (When false the bar is never expandable.)
   */
  priced?: boolean;
}

/**
 * Floating, expandable checkout footer (Figma "bottom-floating"). Collapsed it shows the total
 * (with an optional strikethrough original) + a primary CTA; tapping the chevron / handle expands it
 * **upward** into a `PriceDetails` summary sheet. Floats over the page like `BottomNavigation` — a
 * rounded card with a soft shadow and a top scrim that fades scrolling content into the footer.
 * Designed to be dropped into `PageShell`'s `footer` slot. Everything tokenised, including the motion.
 */
export const CheckoutBar = forwardRef<ViewType, CheckoutBarProps>(function CheckoutBar(
  {
    total,
    oldTotal,
    totalLabel = 'Total',
    cta,
    onCtaPress,
    ctaDisabled,
    ctaLoading,
    summary,
    expanded,
    defaultExpanded = false,
    onExpandedChange,
    safeAreaBottom,
    priced = true,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const bottomInset = safeAreaBottom ?? t.safeArea.bottom;
  const expandable = !!summary && priced;
  const isControlled = expanded !== undefined;
  const [internal, setInternal] = useState(defaultExpanded);
  const open = expandable && (isControlled ? !!expanded : internal);

  // Morph between the unpriced (full-width CTA) and priced (total + compact CTA) layouts.
  const morph = useRef(new Animated.Value(priced ? 1 : 0)).current;
  useEffect(() => {
    const to = priced ? 1 : 0;
    const anim = Animated.timing(morph, {
      toValue: to,
      duration: t.motion.duration.medium,
      easing: Easing.bezier(...(t.motion.easing.standard as [number, number, number, number])),
      useNativeDriver: false, // animates flexGrow/margin (layout) → JS driver
    });
    anim.start();
    const settle = setTimeout(() => morph.setValue(to), t.motion.duration.medium + 60);
    return () => {
      anim.stop();
      clearTimeout(settle);
    };
  }, [priced, t, morph]);

  const setOpen = (next: boolean) => {
    if (!expandable || next === open) return;
    if (!isControlled) setInternal(next);
    onExpandedChange?.(next);
  };
  const toggle = () => setOpen(!open);
  const collapse = () => setOpen(false);

  // Round to a full pill only once the bar has finished COLLAPSING. During the collapse the bar is still
  // tall, and a `pill` (999) radius on a tall view is clamped to height/2 → a content-masking half-circle.
  // So keep the sheet corners (2xl top / size.32 bottom) while collapsing and pill only after it's short
  // (by then pill ≈ its half-height, so no visible jump). Expanding flips back to sheet corners at once.
  const [pillCorners, setPillCorners] = useState(!open);
  useEffect(() => {
    if (open) {
      setPillCorners(false);
      return;
    }
    const id = setTimeout(() => setPillCorners(true), t.motion.duration.medium);
    return () => clearTimeout(id);
  }, [open, t]);

  // Applied to BOTH the shadow caster and the clip below.
  const cardRadii = {
    borderTopLeftRadius: pillCorners ? t.radius.pill : t.radius['2xl'],
    borderTopRightRadius: pillCorners ? t.radius.pill : t.radius['2xl'],
    borderBottomLeftRadius: pillCorners ? t.radius.pill : t.size['32'],
    borderBottomRightRadius: pillCorners ? t.radius.pill : t.size['32'],
  };

  return (
    <View ref={ref} style={[{ width: '100%' }, style]} {...rest}>
      {/* Outside-tap catcher — the expanded panel behaves like a BottomSheet: tapping the page above it
          collapses it. Invisible (no dim: the page must stay readable behind the glass), sized to the
          window and anchored directly above the bar. Only mounted while open, so it never eats taps. */}
      {open ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close price details"
          onPress={collapse}
          style={{ position: 'absolute', left: 0, right: 0, bottom: '100%', height: windowHeight }}
        />
      ) : null}
      {/* No scrim / no solid band: the bar floats and the page scrolls visibly BEHIND the glass, so the
          Liquid Glass refracts the real content (a solid fill here is what made it read as a solid bar). */}
      <View style={{ paddingHorizontal: t.space.md, paddingBottom: bottomInset }}>
        {/* Shadow caster — rounded but NOT clipped: on iOS `overflow:'hidden'` clips the shadow, so the
            elevation lives on this outer view and the clipping happens on the inner one below. The glass
            card + shadow only exist when `priced`; the unpriced (Frequency) step is JUST the floating CTA —
            no solid/glass panel behind it, so the page scrolls cleanly past the button. */}
        <View style={{ ...cardRadii, ...(priced ? elevationToStyle(t.elevation.sheet) : null) }}>
          {/* Clip — rounds the glass + content to the card shape. */}
          <View style={{ ...cardRadii, overflow: 'hidden' }}>
            {/* Liquid-glass backing — real blur + tint; clipped to the pill/sheet shape by the view above.
                `noShadow`: the shadow is cast by the outer view. Omitted when unpriced (no backing). */}
            {priced ? <GlassSurface noShadow radius={t.radius['2xl']} style={StyleSheet.absoluteFill} /> : null}
            {/* Price summary — reveals from the bottom up (height + fade) when expanded. */}
            {expandable ? (
              <Collapsible open={open}>
                <View style={{ paddingHorizontal: t.space.md, paddingTop: t.space.sm, gap: t.space.md }}>
                  {/* Drag handle — tap to collapse. */}
                  <Pressable
                    onPress={toggle}
                    accessibilityRole="button"
                    accessibilityLabel="Hide price details"
                    style={{ alignItems: 'center', paddingVertical: t.size['4'] }}
                  >
                    <View style={{ width: t.size['24'], height: t.size['4'], borderRadius: t.radius.pill, backgroundColor: t.border.default }} />
                  </Pressable>
                  {summary!.header}
                  <PriceDetails
                    embedded
                    title={summary!.title ?? 'Payment Summary'}
                    rows={summary!.rows}
                    total={summary!.total}
                  />
                  <View style={{ height: t.borderWidth.hairline, backgroundColor: t.divider.color.default }} />
                </View>
              </Collapsible>
          ) : null}

          {/* Total + CTA row. The total reveals (flex + fade) and the CTA squeezes to the right as the bar
              morphs from unpriced (full-width CTA) → priced. */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              // Comfortable left inset for the total; the CTA nests snugly against the pill edge.
              paddingLeft: t.space.md,
              paddingRight: t.size['8'],
              paddingVertical: t.size['8'],
            }}
          >
            <Animated.View style={{ flexGrow: morph, flexShrink: 1, flexBasis: 0, opacity: morph, overflow: 'hidden' }}>
              <Pressable
                onPress={toggle}
                disabled={!expandable}
                accessibilityRole={expandable ? 'button' : undefined}
                accessibilityLabel={expandable ? (open ? 'Hide price details' : 'Show price details') : undefined}
              >
                <Text variant="bodyXSmall" color="secondary" numberOfLines={1}>
                  {totalLabel}
                  {oldTotal ? (
                    <Text variant="bodyXSmall" color="tertiary" style={{ textDecorationLine: 'line-through' }}>
                      {'  ' + oldTotal}
                    </Text>
                  ) : null}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.size['4'] }}>
                  <Text variant="titleMedium" numberOfLines={1}>
                    {total}
                  </Text>
                  {expandable ? (
                    <Icon name={open ? 'chevron-down' : 'chevron-up'} size="sm" color={t.icon.secondary} />
                  ) : null}
                </View>
              </Pressable>
            </Animated.View>

            {/* CTA: fills the bar when unpriced; flex-shrinks to content width (with a left gap) when priced. */}
            <Animated.View
              style={{
                flexGrow: morph.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                flexShrink: 0,
                marginLeft: morph.interpolate({ inputRange: [0, 1], outputRange: [0, t.space.md] }),
              }}
            >
              <Button
                variant="secondary"
                shape="pill"
                fullWidth
                // Any forward action collapses the panel first — it must never ride along, still open,
                // onto the next step (the bar persists across a funnel's steps).
                onPress={() => {
                  collapse();
                  onCtaPress?.();
                }}
                disabled={ctaDisabled}
                loading={ctaLoading}
              >
                {cta}
              </Button>
            </Animated.View>
          </View>
          </View>
        </View>
      </View>
    </View>
  );
});
