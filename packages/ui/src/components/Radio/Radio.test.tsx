import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Radio } from './Radio';

describe('Radio', () => {
  it('has radio role and selects on press', () => {
    const onChange = vi.fn();
    renderWithTheme(<Radio accessibilityLabel="Card" onChange={onChange} />);
    const radio = screen.getByRole('radio', { name: 'Card' });
    expect(radio).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(radio);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(radio).toHaveAttribute('aria-checked', 'true');
  });

  it('does not select when disabled', () => {
    const onChange = vi.fn();
    renderWithTheme(<Radio accessibilityLabel="Card" disabled onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Card' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<Radio accessibilityLabel="Card" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
