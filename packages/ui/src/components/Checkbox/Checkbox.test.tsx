import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('has checkbox role and toggles on press', () => {
    const onChange = vi.fn();
    renderWithTheme(<Checkbox accessibilityLabel="Terms" onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Terms' });
    expect(box).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(box).toHaveAttribute('aria-checked', 'true');
  });

  it('reports mixed state when indeterminate', () => {
    renderWithTheme(<Checkbox accessibilityLabel="All" indeterminate />);
    expect(screen.getByRole('checkbox', { name: 'All' })).toHaveAttribute('aria-checked', 'mixed');
  });

  it('does not toggle when disabled', () => {
    const onChange = vi.fn();
    renderWithTheme(<Checkbox accessibilityLabel="Terms" disabled onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Terms' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<Checkbox accessibilityLabel="Terms" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
