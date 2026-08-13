import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { BookingSummary, type BookingSummaryDetail } from './BookingSummary';
import type { PriceDetailsRow } from '../PriceDetails';

const details: BookingSummaryDetail[] = [
  { label: 'Service Details', value: 'Home Cleaning' },
  { label: 'Professional(s)', professional: { name: 'Leila', rating: 4.7 } },
];
const price = {
  rows: [
    { label: 'Subtotal', value: '78.00' },
    { label: 'Discount', value: '−9.00', tone: 'success' },
  ] as PriceDetailsRow[],
  total: { label: 'Total (inc. VAT)', value: '219.00' },
};

describe('BookingSummary', () => {
  it('renders the title, detail rows and professional chip', () => {
    renderWithTheme(<BookingSummary details={details} />);
    expect(screen.getByText('Booking Details')).toBeInTheDocument();
    expect(screen.getByText('Home Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Leila')).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
  });

  it('renders the price breakdown and total when price is given', () => {
    renderWithTheme(<BookingSummary details={details} price={price} />);
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('−9.00')).toBeInTheDocument();
    expect(screen.getByText('Total (inc. VAT)')).toBeInTheDocument();
    expect(screen.getByText('219.00')).toBeInTheDocument();
  });

  it('omits the price section when price is not given', () => {
    renderWithTheme(<BookingSummary details={details} />);
    expect(screen.queryByText('Total (inc. VAT)')).not.toBeInTheDocument();
  });

  it('fires the professional name link onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <BookingSummary details={[{ label: 'Professional(s)', professional: { name: 'Leila', onPress } }]} />,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Leila' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<BookingSummary details={details} price={price} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
