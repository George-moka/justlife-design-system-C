import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { PriceDetails, type PriceDetailsRow } from './PriceDetails';

const rows: PriceDetailsRow[] = [
  { label: 'Subtotal', value: '78.00' },
  { label: 'Discount', value: '−9.00', tone: 'success' },
  { label: 'Service Fee', value: '9.00', info: true },
];
const total = { label: 'Total (inc. VAT)', value: '219.00' };

describe('PriceDetails', () => {
  it('renders the title, line items and total', () => {
    renderWithTheme(<PriceDetails rows={rows} total={total} />);
    expect(screen.getByText('Price Details')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('−9.00')).toBeInTheDocument();
    expect(screen.getByText('Total (inc. VAT)')).toBeInTheDocument();
    expect(screen.getByText('219.00')).toBeInTheDocument();
  });

  it('hides the title when title is null', () => {
    renderWithTheme(<PriceDetails title={null} rows={rows} total={total} />);
    expect(screen.queryByText('Price Details')).not.toBeInTheDocument();
  });

  it('renders the payment-method row', () => {
    renderWithTheme(
      <PriceDetails rows={rows} total={total} paymentMethod={{ label: 'Payment method', value: '**** 0021', logo: 'visa' }} />,
    );
    expect(screen.getByText('Payment method')).toBeInTheDocument();
    expect(screen.getByText('**** 0021')).toBeInTheDocument();
  });

  it('fires the footer onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(<PriceDetails rows={rows} total={total} footer={{ label: 'Show Receipt', onPress }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show Receipt' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <PriceDetails rows={rows} total={total} footer={{ label: 'Show Receipt', onPress: () => {} }} />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
