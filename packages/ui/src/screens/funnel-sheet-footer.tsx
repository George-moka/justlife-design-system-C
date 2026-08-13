import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { HStack } from '../primitives/Stack';
import { Button } from '../components/Button';
import { Price } from './funnel-money';

/**
 * **The ending every sheet in a funnel has.** With nothing picked there is no price to show, so the CTA
 * takes the whole width; the moment something is picked the price reveals on the left and the CTA
 * squeezes to a pill beside it.
 *
 * The morph is the SAME one `CheckoutBar` runs (the price grows + fades in on `flexGrow`/`opacity` while
 * the button gives up its width), on the same motion tokens — so the sheet's footer and the bar it hands
 * off to move alike instead of one snapping while the other glides. Layout properties can't use the
 * native driver, hence `useNativeDriver: false`; a `setTimeout` settles the end state where
 * `requestAnimationFrame` is throttled, and reduce-motion skips straight to it (#35).
 */
export function SheetPriceFooter({
  active,
  price,
  oldPrice,
  cta = 'Add to cart',
  disabled = false,
  onPress,
}: {
  /** Something is selected — reveal the price and squeeze the CTA. */
  active: boolean;
  price: number;
  /** Struck original, shown only when it is actually higher. */
  oldPrice?: number;
  cta?: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  const reducedMotion = useReducedMotion();
  const morph = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    const to = active ? 1 : 0;
    if (reducedMotion) {
      morph.setValue(to);
      return;
    }
    const anim = Animated.timing(morph, {
      toValue: to,
      duration: t.motion.duration.medium,
      easing: Easing.bezier(...(t.motion.easing.standard as [number, number, number, number])),
      useNativeDriver: false, // flexGrow / margin are layout props → JS driver
    });
    anim.start();
    const settle = setTimeout(() => morph.setValue(to), t.motion.duration.medium + 60);
    return () => {
      anim.stop();
      clearTimeout(settle);
    };
  }, [active, reducedMotion, morph, t]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Animated.View
        style={{ flexGrow: morph, flexShrink: 1, flexBasis: 0, opacity: morph, overflow: 'hidden' }}
      >
        {/* The pair reads exactly as it does on the card it came from — new price, old price beside
            it — rather than stacked. It is the same fact, so it is the same shape. */}
        <HStack gap="xs" align="center">
          <Price amount={price} variant="titleMedium" />
          {oldPrice !== undefined && oldPrice > price ? (
            <Price amount={oldPrice} variant="bodyXSmall" color="tertiary" strike />
          ) : null}
        </HStack>
      </Animated.View>
      <Animated.View
        style={{
          flexGrow: morph.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          flexShrink: 0,
          marginLeft: morph.interpolate({ inputRange: [0, 1], outputRange: [0, t.space.md] }),
          // No width cap: giving up `flexGrow` is what shrinks the pill to its label, exactly as the bar
          // does it. A fixed `maxWidth` also clamped the UNPRICED state, so the "full-width" button
          // arrived half a row wide.
        }}
      >
        <Button shape="pill" fullWidth disabled={disabled} onPress={onPress}>
          {cta}
        </Button>
      </Animated.View>
    </View>
  );
}
