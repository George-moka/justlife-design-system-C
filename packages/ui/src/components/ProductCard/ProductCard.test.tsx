import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('renders title and price and adds on press', () => {
    const onQuantityChange = vi.fn();
    renderWithTheme(<ProductCard title="Finish Quantum" price="15" onQuantityChange={onQuantityChange} />);
    expect(screen.getByText('Finish Quantum')).toBeInTheDocument();
    expect(screen.getByText('AED 15')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onQuantityChange).toHaveBeenCalledWith(1);
  });

  it('shows the stepper once added', () => {
    renderWithTheme(<ProductCard title="Softener" price="12" defaultQuantity={2} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <ProductCard title="Finish Quantum" description="All-in-one pack" price="15" oldPrice="30" />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
