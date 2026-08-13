import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('has switch role and reflects state', () => {
    renderWithTheme(<Toggle accessibilityLabel="Wi-Fi" />);
    const sw = screen.getByRole('switch', { name: 'Wi-Fi' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles on press and calls onValueChange', () => {
    const onValueChange = vi.fn();
    renderWithTheme(<Toggle accessibilityLabel="Wi-Fi" onValueChange={onValueChange} />);
    const sw = screen.getByRole('switch', { name: 'Wi-Fi' });
    fireEvent.click(sw);
    expect(onValueChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('does not toggle when disabled', () => {
    const onValueChange = vi.fn();
    renderWithTheme(<Toggle accessibilityLabel="Wi-Fi" disabled onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Wi-Fi' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<Toggle accessibilityLabel="Wi-Fi" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
