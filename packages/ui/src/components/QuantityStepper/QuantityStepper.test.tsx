import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { QuantityStepper } from './QuantityStepper';

describe('QuantityStepper', () => {
  it('increments and decrements', () => {
    const onChange = vi.fn();
    renderWithTheme(<QuantityStepper defaultValue={2} onChange={onChange} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('shows a remove (trash) action at min that clears to 0', () => {
    const onChange = vi.fn();
    renderWithTheme(<QuantityStepper defaultValue={1} min={1} onChange={onChange} />);
    // At the floor the minus turns into Remove — no "Decrease quantity" control.
    expect(screen.queryByRole('button', { name: 'Decrease quantity' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('locks the floor when removable=false (last basket line)', () => {
    const onChange = vi.fn();
    renderWithTheme(<QuantityStepper defaultValue={1} min={1} removable={false} onChange={onChange} />);
    // No Remove affordance at all — the minus stays a (disabled) minus, so the line can't be cleared.
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(onChange).not.toHaveBeenCalled();
    // Increasing still works.
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('collapses to an Add button at 0', () => {
    const onChange = vi.fn();
    renderWithTheme(<QuantityStepper defaultValue={0} onChange={onChange} />);
    const add = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(add);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<QuantityStepper defaultValue={2} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
