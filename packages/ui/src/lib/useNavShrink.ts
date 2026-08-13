import { useCallback, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Instagram-style "shrink on scroll" for the floating `BottomNavigation`. Returns the live `compact` flag
 * plus the scroll handler to wire into `PageShell`'s `onScroll` (pinned screens have no other scroll hook).
 * The threshold matches the home feed (`size.12`), so every tab shrinks at the same offset.
 *
 * `onChange` forwards the flag up: the Expo app hoists ONE persistent nav above all tabs (so its pill slides
 * across tab switches), so screens there report `compact` instead of rendering — and shrinking — their own.
 */
export function useNavShrink(onChange?: (compact: boolean) => void) {
  const t = useTheme();
  const [compact, setCompact] = useState(false);
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = e.nativeEvent.contentOffset.y > t.size['12'];
      setCompact((prev) => {
        if (prev !== next) onChange?.(next);
        return next;
      });
    },
    [t, onChange],
  );
  return { compact, onScroll };
}
