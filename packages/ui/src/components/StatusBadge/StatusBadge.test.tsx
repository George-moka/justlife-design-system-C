import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders its label', () => {
    renderWithTheme(<StatusBadge tone="success">Active</StatusBadge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders for every tone', () => {
    const tones = ['success', 'info', 'error', 'warning', 'neutral'] as const;
    tones.forEach((tone) => {
      const { unmount } = renderWithTheme(<StatusBadge tone={tone}>{tone}</StatusBadge>);
      expect(screen.getByText(tone)).toBeInTheDocument();
      unmount();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<StatusBadge tone="error">Cancelled</StatusBadge>);
    expect((await axe(container)).violations).toEqual([]);
  });
});
