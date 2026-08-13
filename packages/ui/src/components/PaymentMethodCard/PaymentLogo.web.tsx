import React from 'react';
import { paymentLogos } from './logos';
import type { PaymentLogoProps } from './PaymentLogo.types';

/**
 * Web payment-brand logo — renders the extracted SVG as an `<img>` data-URI,
 * scaled to a consistent height (so different logo widths fit one icon slot).
 * Native uses `PaymentLogo.tsx` (react-native-svg).
 */
export function PaymentLogo({ name, label }: PaymentLogoProps) {
  const uri = `data:image/svg+xml,${encodeURIComponent(paymentLogos[name])}`;
  return (
    <img src={uri} alt={label ?? ''} style={{ height: 22, maxWidth: 38, objectFit: 'contain', display: 'block' }} />
  );
}
