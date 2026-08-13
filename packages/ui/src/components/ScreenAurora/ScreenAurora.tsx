import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { RadialGlow } from '../../primitives/RadialGlow';

export interface ScreenAuroraProps {
  /** Extra style merged onto the fill (it already fills its parent via `flex: 1`). */
  style?: StyleProp<ViewStyle>;
}

/**
 * **ScreenAurora** — the soft brand "aurora" band used behind layered screen headers (the funnel steps and
 * the Profile hero): a paper base with two diffuse brand glows. Drop it into `PageShell`'s `band` slot. It
 * fills its parent (`flex: 1`); everything is tokenised. Composes the `RadialGlow` primitive.
 */
export function ScreenAurora({ style }: ScreenAuroraProps) {
  const t = useTheme();
  return (
    <RadialGlow
      style={[{ flex: 1 }, style]}
      baseColor={t.background.paper}
      glows={[
        { color: t.background.brandDefault, x: '84%', y: '95%', opacity: 0.14, radius: '55%' },
        { color: t.background.brandDefault, x: '30%', y: '25%', opacity: 0.12, radius: '55%' },
      ]}
    />
  );
}
