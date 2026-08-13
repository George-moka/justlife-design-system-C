import React, { forwardRef, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  View,
  type View as ViewType,
  type ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Icon } from '../Icon/Icon';
import { hapticTap } from '../../lib/haptics';

export interface SwipeToDeleteProps extends Omit<ViewProps, 'children'> {
  /** The row itself. */
  children: ReactNode;
  /** Fires when the revealed delete action is pressed. */
  onDelete: () => void;
  /** Accessible label for the delete action, e.g. `Remove Gel Mani-Pedi`. */
  deleteLabel: string;
  /**
   * Controlled reveal. Pass `true` to slide the row open from somewhere else — the basket's minus
   * button does this when the quantity is already at 1, so "remove" always costs two deliberate taps.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Corner radius of the row's clip. Pass `0` for a flush row inside a panel that already rounds. */
  radius?: number;
  /**
   * Fill behind the sliding row. It has to be opaque or the action shows through it — but it must be
   * the SURFACE THE ROW SITS ON, not white by default: inside a tinted panel a white row reads as a
   * card within a card. Defaults to `background.primary`.
   */
  rowBackground?: string;
}

/**
 * **Swipe-to-delete row.** A list row that hides a destructive action behind it: drag the row left (or
 * open it from a control) and a red delete button is revealed on the right; the row is only removed
 * when THAT is pressed.
 *
 * The point is the extra beat. A trash icon sitting in a basket row deletes a line on one stray tap —
 * easy to hit by accident and annoying to redo — so removal is split into "reveal" then "confirm",
 * reachable two ways: the familiar swipe, or the stepper's minus once the quantity can't go lower.
 *
 * The drag locks to the horizontal axis and clamps to the action's width, so it can live inside a
 * vertical scroller without fighting it; release snaps open or shut on distance or velocity (and snaps
 * instantly under reduce-motion, #35).
 */
export const SwipeToDelete = forwardRef<ViewType, SwipeToDeleteProps>(function SwipeToDelete(
  { children, onDelete, deleteLabel, open, onOpenChange, radius, rowBackground, style, ...rest },
  ref,
) {
  const t = useTheme();
  const reducedMotion = useReducedMotion();
  const ACTION_W = t.size['64'];
  const r = radius ?? t.radius.default;

  const x = useRef(new Animated.Value(0)).current;
  const [ownOpen, setOwnOpen] = useState(false);
  const isOpen = open ?? ownOpen;
  // The responder closes over this, and it's created once — a ref keeps it reading the live value.
  const openRef = useRef(isOpen);
  openRef.current = isOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setOwnOpen(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );

  useEffect(() => {
    const to = isOpen ? -ACTION_W : 0;
    if (reducedMotion) {
      x.setValue(to);
      return;
    }
    Animated.timing(x, {
      toValue: to,
      duration: t.motion.duration.fast,
      easing: Easing.bezier(...(t.motion.easing.standard as [number, number, number, number])),
      useNativeDriver: true,
    }).start();
  }, [isOpen, ACTION_W, reducedMotion, t.motion.duration.fast, t.motion.easing.standard, x]);

  const pan = useRef(
    PanResponder.create({
      // Claim the gesture only once it's clearly horizontal, so a vertical flick still scrolls the page.
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_e, g) => {
        const base = openRef.current ? -ACTION_W : 0;
        x.setValue(Math.min(0, Math.max(-ACTION_W, base + g.dx)));
      },
      onPanResponderRelease: (_e, g) => {
        const base = openRef.current ? -ACTION_W : 0;
        const at = base + g.dx;
        // Past halfway, or thrown hard enough in either direction.
        const next = g.vx < -0.35 ? true : g.vx > 0.35 ? false : at < -ACTION_W / 2;
        setOpen(next);
        // `setOpen` may be a no-op when the state doesn't change, so settle the offset regardless.
        Animated.timing(x, {
          toValue: next ? -ACTION_W : 0,
          duration: t.motion.duration.fast,
          easing: Easing.bezier(...(t.motion.easing.standard as [number, number, number, number])),
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  return (
    <View ref={ref} style={[{ overflow: 'hidden', borderRadius: r }, style]} {...rest}>
      {/* The action sits UNDER the row, revealed as it slides away: a rounded-rectangle icon button on
          the alert tint — the DS has no full-height colour slab, and a block that tall would also
          arrive flush against the stepper's plus. Centred in its own lane, so it keeps a real gap. */}
      <View style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: ACTION_W, alignItems: 'center', justifyContent: 'center' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
          onPress={() => {
            hapticTap();
            onDelete();
            setOpen(false);
          }}
          style={({ pressed }) => ({
            width: t.size['40'],
            height: t.size['40'],
            borderRadius: t.radius.default,
            alignItems: 'center',
            justifyContent: 'center',
            // The alert tint, not a solid slab of red: a destructive control this small doesn't need
            // to shout, and the pale surface + red glyph is the language alerts already use.
            backgroundColor: pressed ? t.background.errorHover : t.notification.bg.danger,
          })}
        >
          <Icon name="trash-2" size="sm" color={t.text.error} />
        </Pressable>
      </View>

      <Animated.View
        style={{ transform: [{ translateX: x }], backgroundColor: rowBackground ?? t.background.primary }}
        {...pan.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
});
