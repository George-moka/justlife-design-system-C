import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { CheckoutBar } from './CheckoutBar';
import type { PriceDetailsRow } from '../PriceDetails';

const ROWS: PriceDetailsRow[] = [
  { label: 'Subtotal', value: 'AED 78.00' },
  { label: 'Discount', value: '−AED 9.00', tone: 'success' },
];
const SUMMARY = { title: 'Payment Summary', rows: ROWS, total: { label: 'Total (inc. VAT)', value: 'AED 219.00' } };

describe('CheckoutBar', () => {
  it('renders the total, old total and CTA', () => {
    renderWithTheme(<CheckoutBar total="AED 62.10" oldTotal="AED 399.00" cta="Next" summary={SUMMARY} />);
    expect(screen.getByText('AED 62.10')).toBeInTheDocument();
    expect(screen.getByText(/399\.00/)).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('fires onCtaPress', () => {
    const onCtaPress = vi.fn();
    renderWithTheme(<CheckoutBar total="AED 62.10" cta="Complete" onCtaPress={onCtaPress} summary={SUMMARY} />);
    fireEvent.click(screen.getByText('Complete'));
    expect(onCtaPress).toHaveBeenCalledOnce();
  });

  it('hides the summary until expanded, then reveals it', () => {
    renderWithTheme(<CheckoutBar total="AED 62.10" cta="Next" summary={SUMMARY} />);
    expect(screen.queryByText('Payment Summary')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show price details' }));
    expect(screen.getByText('Payment Summary')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
  });

  it('collapses when the CTA is pressed (never rides open onto the next step)', () => {
    const onExpandedChange = vi.fn();
    renderWithTheme(
      <CheckoutBar total="AED 62.10" cta="Next" summary={SUMMARY} onExpandedChange={onExpandedChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Show price details' }));
    expect(screen.getByText('Payment Summary')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Next'));
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByText('Payment Summary')).not.toBeInTheDocument();
  });

  it('collapses when the area outside the panel is tapped (sheet behaviour)', () => {
    renderWithTheme(<CheckoutBar total="AED 62.10" cta="Next" summary={SUMMARY} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show price details' }));
    expect(screen.getByText('Payment Summary')).toBeInTheDocument();
    // The catcher only exists while open; clicking it collapses the panel.
    fireEvent.click(screen.getByRole('button', { name: 'Close price details' }));
    expect(screen.queryByText('Payment Summary')).not.toBeInTheDocument();
  });

  it('shows no chevron / toggle when there is no summary', () => {
    renderWithTheme(<CheckoutBar total="AED 62.10" cta="Next" />);
    expect(screen.queryByRole('button', { name: 'Show price details' })).not.toBeInTheDocument();
  });

  it('respects the controlled expanded prop', () => {
    renderWithTheme(<CheckoutBar total="AED 62.10" cta="Next" summary={SUMMARY} expanded />);
    expect(screen.getByText('Payment Summary')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <CheckoutBar total="AED 62.10" oldTotal="AED 399.00" cta="Next" onCtaPress={() => {}} summary={SUMMARY} />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
