import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import type { StepIndicatorProps } from './types';

/**
 * Native circular step/progress indicator (iOS/Android) using react-native-svg — a track ring with a
 * brand arc filled to `current/total`, the current step number overlaid (RN `Text`, centred). Web uses
 * `StepIndicator.web.tsx` (raw SVG). Everything tokenised.
 */
export function StepIndicator({ current, total, size }: StepIndicatorProps) {
  const t = useTheme();
  const d = size ?? t.size['28'];
  const stroke = t.borderWidth.thick;
  const r = (d - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, total > 0 ? current / total : 0));
  const half = d / 2;
  return (
    <View
      style={{ width: d, height: d, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="image"
      accessibilityLabel={`Step ${current} of ${total}`}
    >
      <Svg width={d} height={d} style={{ position: 'absolute' }}>
        <Circle cx={half} cy={half} r={r} fill="none" stroke={t.border.default} strokeWidth={stroke} />
        <G rotation={-90} origin={`${half}, ${half}`}>
          <Circle
            cx={half}
            cy={half}
            r={r}
            fill="none"
            stroke={t.icon.brand}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
          />
        </G>
      </Svg>
      <Text variant="labelXSmall" color="primary">
        {String(current)}
      </Text>
    </View>
  );
}
