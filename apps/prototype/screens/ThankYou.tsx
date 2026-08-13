import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ThankYouScreen, type ThankYouLeading } from '@justlife/ui';

// Native host for the SHARED Thank-You screen — the exact same `ThankYouScreen` composition Storybook
// renders on web. The only per-platform bit is this frame: real OS insets fed in. One source of truth.
// `leading` selects the hero's top-left control — Thank-You passes `close` (X → home); the same screen is
// reused for Booking Details, which passes `back`.
export function ThankYou({
  leading = 'close',
  onLeadingPress,
}: {
  leading?: ThankYouLeading;
  onLeadingPress: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, t.size['12']);
  return (
    <View style={{ flex: 1, backgroundColor: t.background.canvas }}>
      <ThankYouScreen
        safeAreaTop={safeTop}
        safeAreaBottom={insets.bottom}
        leading={leading}
        onLeadingPress={onLeadingPress}
      />
    </View>
  );
}
