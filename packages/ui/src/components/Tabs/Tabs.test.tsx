import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Tabs } from './Tabs';

const ITEMS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

describe('Tabs', () => {
  it('renders all tab labels', () => {
    renderWithTheme(<Tabs items={ITEMS} activeKey="upcoming" />);
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
    expect(screen.getByText('Past')).toBeInTheDocument();
  });

  it('fires onChange with the tapped tab key', () => {
    const onChange = vi.fn();
    renderWithTheme(<Tabs items={ITEMS} activeKey="upcoming" onChange={onChange} />);
    fireEvent.click(screen.getByText('Past'));
    expect(onChange).toHaveBeenCalledWith('past');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<Tabs items={ITEMS} activeKey="upcoming" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
