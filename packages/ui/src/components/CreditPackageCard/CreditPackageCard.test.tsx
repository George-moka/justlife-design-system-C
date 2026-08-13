import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { CreditPackageCard } from './CreditPackageCard';

describe('CreditPackageCard', () => {
  it('renders tier, save badge, amounts and validity', () => {
    renderWithTheme(
      <CreditPackageCard tier="BASIC" saveLabel="Save 33%" pay="250" get="375" validity="60 day validity." />,
    );
    expect(screen.getByText('BASIC')).toBeInTheDocument();
    expect(screen.getByText('Save 33%')).toBeInTheDocument();
    expect(screen.getByText('AED 250')).toBeInTheDocument();
    expect(screen.getByText('AED 375')).toBeInTheDocument();
    expect(screen.getByText('60 day validity.')).toBeInTheDocument();
  });

  it('fires onBuy when the Buy button is pressed', () => {
    const onBuy = vi.fn();
    renderWithTheme(<CreditPackageCard tier="BASIC" pay="250" get="375" onBuy={onBuy} />);
    fireEvent.click(screen.getByRole('button', { name: 'Buy' }));
    expect(onBuy).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <CreditPackageCard tier="BASIC" saveLabel="Save 33%" pay="250" get="375" validity="60 day validity." />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
