import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import type { StepIndicatorProps } from './types';

/**
 * Web circular step/progress indicator — a track ring with a brand arc filled to `current/total`
 * and the current step number centred. Renders a raw SVG (react-native-svg has no web build here).
 * Native uses `StepIndicator.tsx` (react-native-svg). Everything tokenised.
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
    <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`} role="img" aria-label={`Step ${current} of ${total}`}>
      <circle cx={half} cy={half} r={r} fill="none" stroke={t.border.default} strokeWidth={stroke} />
      <circle
        cx={half}
        cy={half}
        r={r}
        fill="none"
        stroke={t.icon.brand}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct)}
        transform={`rotate(-90 ${half} ${half})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={t.typography.labelXSmall.fontSize}
        fontWeight="600"
        fontFamily="Poppins"
        fill={t.text.primary}
      >
        {current}
      </text>
    </svg>
  );
}
