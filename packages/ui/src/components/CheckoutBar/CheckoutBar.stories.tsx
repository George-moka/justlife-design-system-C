import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { CheckoutBar } from './CheckoutBar';
import type { PriceDetailsRow } from '../PriceDetails';

const ROWS: PriceDetailsRow[] = [
  { label: 'Subtotal', value: 'AED 78.00' },
  { label: 'Discount', value: '−AED 9.00', tone: 'success' },
  { label: 'Service Fee', value: 'AED 9.00', info: true },
];

const meta = {
  title: 'Components/CheckoutBar',
  component: CheckoutBar,
  args: {
    total: 'AED 62.10',
    oldTotal: 'AED 399.00',
    cta: 'Next',
    onCtaPress: () => {},
    summary: { title: 'Payment Summary', rows: ROWS, total: { label: 'Total (inc. VAT)', value: 'AED 219.00' } },
  },
  // The bar floats at the bottom; frame it against some height so the float reads.
  decorators: [
    (Story) => (
      <View style={{ height: 280, justifyContent: 'flex-end', backgroundColor: '#F5F5F5' }}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Floating, expandable checkout footer (Figma "bottom-floating"). Collapsed: total (+ optional strikethrough original) and a CTA. Tapping the chevron/handle expands it upward into a `PriceDetails` summary. Built for `PageShell`\'s `footer` slot; floats like `BottomNavigation` with a top scrim that fades scrolling content underneath.',
      },
    },
  },
} satisfies Meta<typeof CheckoutBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Collapsed — total bar + CTA + chevron.
export const Collapsed: Story = {};

// Expanded — the Payment Summary sheet above the bar.
export const Expanded: Story = { args: { defaultExpanded: true, cta: 'Complete' } };

// Plain bar with no expandable summary (no chevron).
export const NoSummary: Story = { args: { summary: undefined } };
