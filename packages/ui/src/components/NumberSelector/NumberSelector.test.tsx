import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { NumberSelector } from './NumberSelector';

describe('NumberSelector', () => {
  it('renders chips from 1..count', () => {
    renderWithTheme(<NumberSelector count={4} value={2} onChange={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('fires onChange with the tapped number', () => {
    const onChange = vi.fn();
    renderWithTheme(<NumberSelector count={4} value={2} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('respects min', () => {
    renderWithTheme(<NumberSelector count={5} min={3} value={3} onChange={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(3); // 3,4,5
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<NumberSelector count={4} value={2} onChange={() => {}} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
