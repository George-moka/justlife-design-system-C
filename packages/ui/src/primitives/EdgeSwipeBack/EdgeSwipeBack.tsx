import React, { useRef, type ReactNode } from 'react';
import { PanResponder, useWindowDimensions, View, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface EdgeSwipeBackProps extends Omit<ViewProps, 'children'> {
  /** Same handler as the header's back control — the gesture must never mean something else. */
  onBack: () => void;
  children: ReactNode;
  /** Turn the gesture off (e.g. a step that must not be left by accident). Default `true`. */
  enabled?: boolean;
  /** How far in from the left edge a drag may start. Default `size.24`, iOS's own pop zone. */
  edgeWidth?: number;
}

/**
 * **Edge-swipe back.** Wraps a pushed screen so a drag in from the LEFT EDGE goes back, the way every iOS
 * screen does — a back button alone leaves the gesture people reach for doing nothing.
 *
 * It claims a drag only when the finger started inside `edgeWidth` and is clearly horizontal, so the
 * screen's own scrollers, carousels and swipeable rows keep every touch that isn't an edge pull.
 *
 * **It does not move the screen, on purpose.** An interactive pop — the page following your finger with
 * the previous one underneath — needs BOTH screens mounted, which is a navigator's job. This app's router
 * swaps one screen for the other, so anything the wrapper animates is still on top when it is replaced,
 * and that frame is the flick this deliberately avoids: the gesture fires the moment it is recognised,
 * exactly like tapping back. Wire `react-navigation` and this becomes a real interactive pop.
 */
export function EdgeSwipeBack({
  onBack,
  children,
  enabled = true,
  edgeWidth,
  style,
  ...rest
}: EdgeSwipeBackProps) {
  const t = useTheme();
  const { width } = useWindowDimensions();

  // The responder is created once, so live values it reads have to come through refs.
  const live = useRef({ onBack, enabled, width });
  live.current = { onBack, enabled, width };
  const fired = useRef(false);
  const edge = edgeWidth ?? t.size['24'];

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, g) => {
        if (!live.current.enabled) return false;
        // Where the finger went down — `pageX` is the CURRENT point, so subtract the travel.
        const startX = e.nativeEvent.pageX - g.dx;
        return startX <= edge && g.dx > t.size['6'] && g.dx > Math.abs(g.dy) * 1.5;
      },
      onPanResponderGrant: () => {
        fired.current = false;
      },
      onPanResponderMove: (_e, g) => {
        // Fire as soon as the pull is unmistakably a back gesture — once per gesture.
        if (fired.current) return;
        if (g.dx > live.current.width * 0.25 || (g.dx > t.size['24'] && g.vx > 0.6)) {
          fired.current = true;
          live.current.onBack();
        }
      },
    }),
  ).current;

  return (
    <View style={[{ flex: 1 }, style]} {...pan.panHandlers} {...rest}>
      {children}
    </View>
  );
}
