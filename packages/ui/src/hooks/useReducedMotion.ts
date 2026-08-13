import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * `true` when the user has asked the OS to reduce motion. Read once on mount and kept live, so a
 * component can drop its transition mid-session the moment the setting changes.
 *
 * Every screen animation must be gated on this (rule #35) — call it and skip the animation, don't just
 * shorten it.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    // Only flip when it's actually on: the initial read resolves asynchronously, and a no-op `setState`
    // after mount is pure noise (and an `act(...)` warning in tests). The listener covers later changes.
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => {
      if (alive && v) setReduced(true);
    });
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);

  return reduced;
}
