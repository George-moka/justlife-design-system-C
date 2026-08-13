import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { DatePicker } from './DatePicker';

const DAYS = [
  { day: 'FRI', date: 19 },
  { day: 'SAT', date: 20 },
  { day: 'SUN', date: 21 },
];

describe('DatePicker', () => {
  it('renders the day strip', () => {
    renderWithTheme(<DatePicker days={DAYS} value={19} onChange={() => {}} />);
    expect(screen.getByText('FRI')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('fires onChange with the tapped date', () => {
    const onChange = vi.fn();
    renderWithTheme(<DatePicker days={DAYS} value={19} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'SUN 21' }));
    expect(onChange).toHaveBeenCalledWith(21);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<DatePicker days={DAYS} value={19} onChange={() => {}} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
