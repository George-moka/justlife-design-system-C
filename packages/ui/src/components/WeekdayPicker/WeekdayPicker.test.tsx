import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { WeekdayPicker } from './WeekdayPicker';

describe('WeekdayPicker', () => {
  it('renders seven day chips', () => {
    renderWithTheme(<WeekdayPicker value={[]} onToggle={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(7);
  });

  it('fires onToggle with the day key', () => {
    const onToggle = vi.fn();
    renderWithTheme(<WeekdayPicker value={['wed']} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'mon' }));
    expect(onToggle).toHaveBeenCalledWith('mon');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<WeekdayPicker value={['wed', 'sat']} onToggle={() => {}} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
