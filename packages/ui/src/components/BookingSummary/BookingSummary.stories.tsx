import type { Meta, StoryObj } from '@storybook/react';
import { BookingSummary, type BookingSummaryDetail } from './BookingSummary';
import type { PriceDetailsRow } from '../PriceDetails';

const HEAL = '/profile%20photos/profilepic_heal.png';

// Real content from the Figma "summary=with payment".
const DETAILS: BookingSummaryDetail[] = [
  { label: 'Date & Time', value: '7 Jul 2022,\n09:00-09:30' },
  { label: 'Professional(s)', professional: { name: 'Leila', rating: 4.7, photo: HEAL, onPress: () => {} } },
  { label: 'Service Details', value: 'Home Cleaning' },
  { label: 'Add ons', value: '1x Party Cleaning - 1x Balcony Cleaning' },
  { label: 'Materials', value: 'With Materials' },
  { label: 'Full Session Duration', value: '55 mins' },
  { label: 'Frequency', value: 'One time' },
];

// Grid layout: long/rich items span the full row; each main (left) field pairs with a slim `narrow`
// field on the right (short values like Frequency/Materials), so the long field gets the room.
const GRID_DETAILS: BookingSummaryDetail[] = [
  { label: 'Professional(s)', professional: { name: 'Leila', rating: 4.7, photo: HEAL, onPress: () => {} }, wide: true },
  { label: 'Date & Time', value: '7 Jul 2022, 09:00-09:30', wide: true },
  { label: 'Service Details', value: 'Handyman & Maintenance' },
  { label: 'Frequency', value: 'One time', narrow: true },
  { label: 'Full Session Duration', value: '55 mins' },
  { label: 'Materials', value: 'With Materials', narrow: true },
  { label: 'Add ons', value: '1x Party Cleaning - 1x Balcony Cleaning', wide: true },
];

const PRICE_ROWS: PriceDetailsRow[] = [
  { label: 'Subtotal', value: '78.00' },
  { label: 'Discount', value: '−9.00', tone: 'success' },
  { label: 'Service Fee', value: '9.00', info: true },
];

const meta = {
  title: 'Components/BookingSummary',
  component: BookingSummary,
  args: {
    details: DETAILS,
    price: { rows: PRICE_ROWS, total: { label: 'Total (inc. VAT)', value: '219.00' } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Booking summary (Figma "Summary" → `summary=with payment`). Booking detail rows (incl. a professional chip with avatar + linked name + rating) plus the cost breakdown + total. **Improved over the Figma:** the original uses invisible card-coloured dividers and a flat, same-weight total; here the sections are split by visible dividers and the total is emphasised so the dense summary stays scannable.',
      },
    },
  },
} satisfies Meta<typeof BookingSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

// CURRENT (Figma `rows`): label left / value right. Long right-column values (Date & Time, Add ons)
// wrap and create the uneven 2× row spacing.
export const WithPayment: Story = {};

// ALTERNATIVE (`grid`): caption-over-value 2-column grid. Each value wraps under its own small label,
// so there's no uneven row spacing; long/rich items span both columns. Compare with WithPayment.
export const WithPaymentGrid: Story = {
  args: { details: GRID_DETAILS, layout: 'grid' },
};

// Details only (no price section).
export const DetailsOnly: Story = { args: { price: undefined } };
