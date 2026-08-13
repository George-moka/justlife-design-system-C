import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { CategoryCard } from './CategoryCard';

describe('CategoryCard', () => {
  it('renders its label and toggles selection', () => {
    const onChange = vi.fn();
    renderWithTheme(<CategoryCard label="Cleaning" onChange={onChange} />);
    const card = screen.getByRole('button', { name: 'Cleaning' });
    expect(card).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(card);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<CategoryCard label="Cleaning" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
