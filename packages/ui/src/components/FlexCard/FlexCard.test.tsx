import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { FlexCard } from './FlexCard';

describe('FlexCard', () => {
  it('renders title and price, and adds on press', () => {
    const onQuantityChange = vi.fn();
    renderWithTheme(<FlexCard title="Summer Combo" price="199" onQuantityChange={onQuantityChange} />);
    expect(screen.getByText('Summer Combo')).toBeInTheDocument();
    expect(screen.getByText('AED 199')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onQuantityChange).toHaveBeenCalledWith(1);
  });

  it('shows a stepper once added and increments', () => {
    const onQuantityChange = vi.fn();
    renderWithTheme(<FlexCard title="Add-on" price="89" defaultQuantity={2} onQuantityChange={onQuantityChange} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onQuantityChange).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(onQuantityChange).toHaveBeenLastCalledWith(2);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<FlexCard title="Summer Combo" price="199" oldPrice="249" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
