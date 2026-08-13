import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type View as ViewType,
  type ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { elevationToStyle } from '../../theme/style-helpers';
import { Text } from '../../primitives/Text';
import { GlassSurface } from '../../primitives/GlassSurface';

export interface SegmentedControlOption {
  key: string;
  label: string;
}

export interface SegmentedControlProps extends Omit<ViewProps, 'children'> {
  /** The segments, left → right. */
  options: SegmentedControlOption[];
  /** The selected segment's `key`. */
  value: string;
  onChange: (key: string) => void;
}

/**
 * **SegmentedControl** — a compact single-select toggle: a **liquid-glass** pill track (refracts the content
 * behind it) with a single **brand pill** that **slides** to the selected segment. For 2–3 mutually-exclusive
 * views in a header (Bookings' Upcoming / Past; Wallet's Transactions / Cashback; …). Fully tokenised.
 *
 * The pill animates its position + width between the measured segments (motion tokens; reduce-motion → it
 * jumps). A11y: `tablist` / `tab` with `accessibilityState.selected` (a `button` role can't carry
 * `aria-selected`); the sliding pill is decorative (`pointerEvents="none"`).
 */
export const SegmentedControl = forwardRef<ViewType, SegmentedControlProps>(function SegmentedControl(
  { options, value, onChange, style, ...rest },
  ref,
) {
  const t = useTheme();
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const [reduceMotion, setReduceMotion] = useState(false);
  const pillX = useRef(new Animated.Value(0)).current;
  const pillW = useRef(new Animated.Value(0)).current;
  const placed = useRef(false); // first placement snaps (no slide from x=0)

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((r) => alive && setReduceMotion(r));
    return () => {
      alive = false;
    };
  }, []);

  const target = layouts[value];
  useEffect(() => {
    if (!target) return;
    if (!placed.current || reduceMotion) {
      pillX.setValue(target.x);
      pillW.setValue(target.width);
      placed.current = true;
      return;
    }
    Animated.parallel([
      Animated.timing(pillX, { toValue: target.x, duration: t.motion.duration.medium, easing: Easing.bezier(...t.motion.easing.standard), useNativeDriver: false }),
      Animated.timing(pillW, { toValue: target.width, duration: t.motion.duration.medium, easing: Easing.bezier(...t.motion.easing.standard), useNativeDriver: false }),
    ]).start();
  }, [target?.x, target?.width, reduceMotion, pillX, pillW, t.motion.duration.medium, t.motion.easing.standard]);

  const onSegmentLayout = (key: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => (prev[key]?.x === x && prev[key]?.width === width ? prev : { ...prev, [key]: { x, width } }));
  };

  return (
    <View
      ref={ref}
      accessibilityRole="tablist"
      // No `overflow: hidden` — it would clip the shadow on native; the glass + pill are self-rounded, so
      // nothing bleeds. A soft `raised` shadow lifts the glass track off the surface behind it.
      style={[
        {
          flexDirection: 'row',
          borderRadius: t.radius.pill,
          padding: t.size['2'],
          ...elevationToStyle(t.elevation.raised),
        },
        style,
      ]}
      {...rest}
    >
      {/* Liquid-glass track — refracts the content behind it. */}
      <GlassSurface noShadow radius={t.radius.pill} style={StyleSheet.absoluteFill} />
      <View style={{ flexDirection: 'row' }}>
        {/* The single brand pill that slides to the selected segment (sits behind the labels). */}
        {target ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: pillW,
              transform: [{ translateX: pillX }],
              backgroundColor: t.background.brandDefault,
              borderRadius: t.radius.pill,
            }}
          />
        ) : null}
        {options.map((o) => {
          const selected = o.key === value;
          return (
            <Pressable
              key={o.key}
              onLayout={onSegmentLayout(o.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={o.label}
              onPress={() => onChange(o.key)}
              style={{ paddingHorizontal: t.space.md, paddingVertical: t.size['6'], borderRadius: t.radius.pill }}
            >
              <Text variant="labelMedium" style={{ color: selected ? t.text.onBrand : t.text.primary }}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});
