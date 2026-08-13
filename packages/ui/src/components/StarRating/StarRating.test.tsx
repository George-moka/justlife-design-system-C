import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('renders `max` stars', () => {
    const { container } = renderWithTheme(<StarRating value={3} max={5} />);
    expect(container.querySelectorAll('svg').length).toBe(5);
  });

  it('calls onRate with the 1-based star value when tapped', () => {
    const onRate = vi.fn();
    renderWithTheme(<StarRating value={0} onRate={onRate} />);
    fireEvent.click(screen.getByLabelText('Rate 4 of 5'));
    expect(onRate).toHaveBeenCalledWith(4);
  });

  it('has no accessibility violations (read-only and interactive)', async () => {
    const ro = renderWithTheme(<StarRating value={4} />);
    expect((await axe(ro.container)).violations).toEqual([]);
    const io = renderWithTheme(<StarRating value={0} onRate={() => {}} />);
    expect((await axe(io.container)).violations).toEqual([]);
  });
});
