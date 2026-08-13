import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, WomensSalonFunnelScreen } from '@justlife/ui';

// Native host for the SHARED Women's Salon flex funnel — the exact same `WomensSalonFunnelScreen`
// composition Storybook renders on web, framed with the real OS insets (same pattern as
// HomeCleaningFunnel). NOTE: the step-1 hero video is web-only for now — native shows the dark band
// until expo-video is wired in.
export function WomensSalonFunnel({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: t.background.canvas }}>
      <WomensSalonFunnelScreen
        safeAreaTop={insets.top}
        safeAreaBottom={insets.bottom}
        onExit={onBack}
        onComplete={onComplete}
      />
    </View>
  );
}
