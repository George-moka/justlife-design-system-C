import type { PaymentLogoName } from './logos';

export interface PaymentLogoProps {
  /** Brand logo key (e.g. "visa", "mastercard"). */
  name: PaymentLogoName;
  /** Accessible label; omit for decorative use. */
  label?: string;
}
