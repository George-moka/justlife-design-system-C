import React from 'react';
import { SvgXml } from 'react-native-svg';
import { paymentLogos } from './logos';
import type { PaymentLogoProps } from './PaymentLogo.types';

/**
 * Native payment-brand logo (iOS/Android) — renders the extracted SVG markup
 * via react-native-svg. Web uses `PaymentLogo.web.tsx`.
 */
export function PaymentLogo({ name, label }: PaymentLogoProps) {
  return <SvgXml xml={paymentLogos[name]} accessibilityLabel={label} />;
}
