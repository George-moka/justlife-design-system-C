import type { Meta, StoryObj } from '@storybook/react';
import { PriceDetails, type PriceDetailsRow } from './PriceDetails';

// Real content from the Figma "Price Details".
const ROWS: PriceDetailsRow[] = [
  { label: 'Subtotal', value: '78.00' },
  { label: 'Discount', value: '−9.00', tone: 'success' },
  { label: 'Service Fee', value: '9.00', info: true },
];

const meta = {
  title: 'Components/PriceDetails',
  component: PriceDetails,
  args: {
    rows: ROWS,
    total: { label: 'Total (inc. VAT)', value: '219.00' },
    paymentMethod: { label: 'Payment method', value: '**** 0021', logo: 'visa' },
    footer: { label: 'Show Receipt' },
  },
  argTypes: { footer: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          'Price Details (Figma "Price Details"). A checkout bill card: label/amount rows (discounts in the success green, fees with an optional info icon), a divider, a total, an optional payment-method row (composing `PaymentLogo`), and an optional tappable receipt footer. Amounts are pre-formatted strings (the AED currency glyph is a parked asset).',
      },
    },
  },
} satisfies Meta<typeof PriceDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

// Full bill: rows + total + payment method + receipt footer.
export const Default: Story = {
  args: { footer: { label: 'Show Receipt', onPress: () => {} } },
};

// Just the breakdown + total (no payment row or footer).
export const Minimal: Story = {
  args: { paymentMethod: undefined, footer: undefined },
};
