import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, HomeCleaningFunnelScreen } from '@justlife/ui';

// Native host for the SHARED Home Cleaning funnel — the exact same `HomeCleaningFunnelScreen` composition
// Storybook renders on web. The only per-platform bit is this frame: a flex View under SafeAreaProvider,
// feeding the real OS insets in. One source of truth, no web/native drift.
export function HomeCleaningFunnel({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: t.background.canvas }}>
      <HomeCleaningFunnelScreen
        safeAreaTop={insets.top}
        safeAreaBottom={insets.bottom}
        onExit={onBack}
        onComplete={onComplete}
      />
    </View>
  );
}
