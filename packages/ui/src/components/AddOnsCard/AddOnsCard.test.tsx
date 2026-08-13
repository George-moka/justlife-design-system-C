import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { AddOnsCard } from './AddOnsCard';

describe('AddOnsCard', () => {
  it('renders title and price and adds on press', () => {
    const onQuantityChange = vi.fn();
    renderWithTheme(<AddOnsCard title="Balcony Cleaning" price="15" oldPrice="10" onQuantityChange={onQuantityChange} />);
    expect(screen.getByText('Balcony Cleaning')).toBeInTheDocument();
    expect(screen.getByText('AED 15')).toBeInTheDocument();
    expect(screen.getByText('AED 10')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onQuantityChange).toHaveBeenCalledWith(1);
  });

  it('shows the stepper once added', () => {
    renderWithTheme(<AddOnsCard title="Ironing Service" price="20" defaultQuantity={2} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeInTheDocument();
  });

  it('fires onLearnMore', () => {
    const onLearnMore = vi.fn();
    renderWithTheme(<AddOnsCard title="Balcony Cleaning" price="15" onLearnMore={onLearnMore} />);
    fireEvent.click(screen.getByRole('button', { name: 'Learn More' }));
    expect(onLearnMore).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<AddOnsCard title="Balcony Cleaning" price="15" oldPrice="10" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
