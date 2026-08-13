import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface CollapsibleProps {
  /** When true the content mounts + reveals (height + fade in); false animates out, then unmounts. */
  open: boolean;
  children: React.ReactNode;
  /** Animation duration (ms). Defaults to `motion.duration.medium`. */
  duration?: number;
  style?: ViewStyle;
}

/**
 * Smooth height + fade reveal. On `open` it mounts the content, measures it, and animates a single
 * `progress` value — interpolating **height** `0 ↔ content` and **opacity** `0 ↔ 1` with the `motion`
 * tokens; on close it animates back, then **unmounts** (collapsed content leaves the tree → a11y-clean,
 * out of hit-testing). Cross-platform (RN `Animated`; height is JS-driven on web + native).
 *
 * The content is measured via an **absolutely-positioned** wrapper so it reports its natural height free
 * of the clamped parent — an in-flow child reports the clamped `0` height on native, which left the panel
 * permanently collapsed. A `setTimeout` settles `progress` (and the unmount) so the end state is
 * guaranteed even where `requestAnimationFrame` is throttled (background tabs, headless renderers).
 */
export function Collapsible({ open, children, duration, style }: CollapsibleProps) {
  const t = useTheme();
  const dur = duration ?? t.motion.duration.medium;
  const easing = Easing.bezier(...(t.motion.easing.standard as [number, number, number, number]));
  const [rendered, setRendered] = useState(open);
  const [contentH, setContentH] = useState<number | null>(null);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    if (open) setRendered(true);
    const to = open ? 1 : 0;
    const anim = Animated.timing(progress, { toValue: to, duration: dur, easing, useNativeDriver: false });
    anim.start(({ finished }) => {
      if (finished && !open) setRendered(false);
    });
    const settle = setTimeout(() => {
      progress.setValue(to);
      if (!open) setRendered(false);
    }, dur + 60);
    return () => {
      anim.stop();
      clearTimeout(settle);
    };
  }, [open, dur]);

  if (!rendered) return null;

  return (
    <Animated.View
      style={[
        {
          height: contentH == null ? 0 : progress.interpolate({ inputRange: [0, 1], outputRange: [0, contentH] }),
          opacity: progress,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* Absolute so the wrapper sizes to its natural content height regardless of the parent's clamped
          (0 / animating) height — an in-flow child reports the clamped height on native and never expands. */}
      <View
        style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
        onLayout={(e) => {
          const next = Math.round(e.nativeEvent.layout.height);
          if (next > 0 && next !== contentH) setContentH(next);
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}
