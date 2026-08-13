import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { SegmentedControl } from './SegmentedControl';

const OPTIONS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

describe('SegmentedControl', () => {
  it('renders every segment label', () => {
    renderWithTheme(<SegmentedControl options={OPTIONS} value="upcoming" onChange={() => {}} />);
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
    expect(screen.getByText('Past')).toBeInTheDocument();
  });

  it('renders a tab per option and fires onChange for the tapped one', () => {
    const onChange = vi.fn();
    renderWithTheme(<SegmentedControl options={OPTIONS} value="upcoming" onChange={onChange} />);
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    fireEvent.click(screen.getByText('Past'));
    expect(onChange).toHaveBeenCalledWith('past');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <SegmentedControl options={OPTIONS} value="past" onChange={() => {}} />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
