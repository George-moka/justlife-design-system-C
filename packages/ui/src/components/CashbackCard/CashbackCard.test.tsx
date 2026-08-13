import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { CashbackCard } from './CashbackCard';

describe('CashbackCard', () => {
  it('renders title, amount and expiry', () => {
    renderWithTheme(
      <CashbackCard title="Cashback - Home Cleaning" amount="35.00" expiry="Expires on Jun 28, 2022" />,
    );
    expect(screen.getByText('Cashback - Home Cleaning')).toBeInTheDocument();
    expect(screen.getByText('AED 35.00')).toBeInTheDocument();
    expect(screen.getByText('Expires on Jun 28, 2022')).toBeInTheDocument();
  });

  it('fires onApply from the Default state', () => {
    const onApply = vi.fn();
    renderWithTheme(<CashbackCard title="Cashback" amount="35.00" onApply={onApply} />);
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('shows the Applied label when applied', () => {
    renderWithTheme(<CashbackCard title="Cashback" amount="35.00" applied />);
    expect(screen.getByRole('button', { name: 'Applied' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <CashbackCard
        title="Cashback - Home Cleaning"
        amount="35.00"
        description="Only valid on weekdays."
        expiry="Expires on Jun 28, 2022"
      />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
