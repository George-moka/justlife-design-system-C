import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, Pressable, type View as ViewType } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassSurface } from '../../primitives/GlassSurface';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';

export type ToastTone = 'neutral' | 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  /** Button label, e.g. "Undo", "View". */
  label: string;
  onPress: () => void;
}

export interface ToastProps {
  /** The message. Wraps to a second line, then truncates. */
  message: string;
  /** Tone — sets the leading icon + its colour. Default `neutral` (no icon). */
  tone?: ToastTone;
  /** Override the leading icon (Lucide name). `null` forces no icon; omit to use the tone's default. */
  icon?: string | null;
  /** A single trailing action (e.g. "Undo"). */
  action?: ToastAction;
  /** Show the trailing ✕. Defaults to `true` when there's **no** action, `false` when there is. */
  dismissible?: boolean;
  /** Fired by the ✕ **and** by a swipe-to-dismiss. */
  onDismiss?: () => void;
  /** Animate **in** (`true`) or **out** (`false`); mirrors `BottomSheet`. Default `true`. */
  open?: boolean;
  /** Anchor / slide direction — `top` slides down from the top (default, iOS-notification style), `bottom` slides up. */
  position?: 'top' | 'bottom';
  /** Safe-area inset on the anchored edge — so the slide fully clears the status bar / home indicator. */
  inset?: number;
  /** Called once the exit animation has finished (after `open` flips to `false`). */
  onExited?: () => void;
}

/** Default Lucide glyph per tone. `neutral` shows none unless an `icon` is passed. */
const TONE_ICON: Record<ToastTone, string | null> = {
  neutral: null,
  success: 'circle-check',
  error: 'circle-alert',
  info: 'info',
  warning: 'triangle-alert',
};

/**
 * **Toast / Snackbar** — a transient, self-dismissing message bar styled as a **chubby liquid-glass pill**
 * (the DS `GlassSurface`) that refracts the content behind it, like an iOS notification. The tone is carried
 * by a coloured **leading icon** (success/error/info/warning) rather than tinting the whole bar; dark text
 * keeps it legible on the light glass. Holds an optional **action** (e.g. "Undo") and/or a **✕**.
 *
 * Motion: it **slides in from the anchored edge** (top by default) and can be **swiped back toward that edge
 * to dismiss** — driven via the `top` offset (NOT `transform`/`opacity`, so the glass survives: web's
 * `backdrop-filter` no-ops under a transformed ancestor, and native Liquid Glass breaks if an ancestor
 * animates opacity). Presentational only — drive timing/queue/placement via `ToastProvider` + `useToast()`.
 * A `setTimeout` settles the end state where `requestAnimationFrame` is throttled (headless preview).
 */
export const Toast = forwardRef<ViewType, ToastProps>(function Toast(
  { message, tone = 'neutral', icon, action, dismissible, onDismiss, open = true, position = 'top', inset = 0, onExited },
  ref,
) {
  const t = useTheme();
  const dismissDir = position === 'top' ? -1 : 1; // toward the anchored edge (where it hides)

  const [rendered, setRendered] = useState(open);
  const [measured, setMeasured] = useState(0);
  // Slide offset in px (NOT a transform — keeps the glass alive on web + native). Starts off-screen so it
  // animates IN on mount; a generous initial guess (real height fills in after first layout).
  const offset = useRef(new Animated.Value(dismissDir * (t.size['80'] + inset + t.space.sm))).current;
  const baseRef = useRef(0);
  const firedExit = useRef(false);
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;

  // Latest values for the (once-created) PanResponder to read without going stale.
  const swipeRef = useRef({ dismissDir, onDismiss });
  swipeRef.current = { dismissDir, onDismiss };

  useEffect(() => {
    if (open) {
      firedExit.current = false;
      setRendered(true);
    }
  }, [open]);

  // Drive the slide for the open/close lifecycle. Entrance: from off-screen → 0. Exit: from wherever it is
  // (possibly mid-swipe) → off-screen, then settle + notify. Layout-animated (`top`), so no native driver.
  useEffect(() => {
    if (!rendered) return;
    const target = open ? 0 : dismissDir * ((measured || t.size['80']) + inset + t.space.sm);
    const duration = open ? t.motion.duration.medium : t.motion.duration.fast;
    const easing = Easing.bezier(
      ...((open ? t.motion.easing.decelerate : t.motion.easing.accelerate) as [number, number, number, number]),
    );
    // Settling the exit (set rendered false + notify) must run at most once across the anim callback and the
    // fallback timeout, or onExited double-fires and the queue advances twice.
    const settleExit = () => {
      if (open || firedExit.current) return;
      firedExit.current = true;
      setRendered(false);
      onExitedRef.current?.();
    };
    const anim = Animated.timing(offset, { toValue: target, duration, easing, useNativeDriver: false });
    anim.start(({ finished }) => {
      if (finished) settleExit();
    });
    const settle = setTimeout(() => {
      offset.setValue(target);
      settleExit();
    }, duration + 60);
    return () => {
      anim.stop();
      clearTimeout(settle);
    };
    // measured/inset feed the exit target; re-running on their change is harmless (entrance just re-targets 0).
  }, [open, rendered, t, offset, dismissDir, measured, inset]);

  // Swipe toward the anchored edge to dismiss (iOS-notification style). Only claims clearly vertical drags so
  // taps on the action/✕ still register. Created once; reads the latest handlers via swipeRef.
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => {
        offset.stopAnimation((v) => {
          baseRef.current = v;
        });
      },
      onPanResponderMove: (_e, g) => {
        const { dismissDir: dir } = swipeRef.current;
        // Free movement toward the edge; resistance (×0.2) pulling away from it.
        const toward = dir < 0 ? Math.min(g.dy, 0) : Math.max(g.dy, 0);
        const away = g.dy - toward;
        offset.setValue(baseRef.current + toward + away * 0.2);
      },
      onPanResponderRelease: (_e, g) => {
        const { dismissDir: dir, onDismiss: dismiss } = swipeRef.current;
        const towardDist = dir < 0 ? -g.dy : g.dy; // px dragged toward the edge
        const towardVel = dir < 0 ? -g.vy : g.vy; // velocity toward the edge
        if (towardDist > 28 || towardVel > 0.5) {
          // Hand off to the lifecycle: onDismiss flips `open` → the effect slides it the rest of the way out
          // from the current position (single animator, no jump).
          dismiss?.();
        } else {
          Animated.spring(offset, { toValue: 0, useNativeDriver: false, bounciness: 6, speed: 14 }).start();
        }
      },
    }),
  ).current;

  if (!rendered) return null;

  const iconName = icon === null ? null : (icon ?? TONE_ICON[tone]);
  const toneColor =
    tone === 'success'
      ? t.icon.success
      : tone === 'error'
        ? t.icon.error
        : tone === 'info'
          ? t.icon.info
          : tone === 'warning'
            ? t.icon.warning
            : t.icon.primary;
  const showClose = dismissible ?? !action;

  return (
    <Animated.View
      ref={ref}
      accessibilityLiveRegion="polite"
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      onLayout={(e) => {
        const h = Math.round(e.nativeEvent.layout.height);
        if (h > 0 && measured === 0) setMeasured(h);
      }}
      style={{ top: offset }}
      {...pan.panHandlers}
    >
      <GlassSurface radius={t.radius['2xl']} tint="strong">
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.space.sm,
            paddingVertical: t.space.md,
            paddingLeft: t.space.md,
            paddingRight: t.space.sm,
            minHeight: t.size['64'],
          }}
        >
          {iconName ? <Icon name={iconName} size="sm" color={toneColor} /> : null}

          <Text variant="bodyMedium" color="primary" numberOfLines={2} style={{ flex: 1 }}>
            {message}
          </Text>

          {action ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={action.label}
              hitSlop={t.space.sm}
              onPress={action.onPress}
              style={({ pressed }) => ({ paddingHorizontal: t.space.xs, opacity: pressed ? 0.6 : 1 })}
            >
              <Text variant="labelLarge" style={{ color: t.text.brand }}>
                {action.label}
              </Text>
            </Pressable>
          ) : null}

          {showClose ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
              hitSlop={t.space.sm}
              onPress={onDismiss}
              style={({ pressed }) => ({
                width: t.size['32'],
                height: t.size['32'],
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Icon name="x" size="sm" color={t.icon.secondary} />
            </Pressable>
          ) : null}
        </Animated.View>
      </GlassSurface>
    </Animated.View>
  );
});
