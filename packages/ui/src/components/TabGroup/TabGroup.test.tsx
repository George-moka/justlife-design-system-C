import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { TabGroup, type TabGroupItem } from './TabGroup';

const items: TabGroupItem[] = [
  { key: 'all', label: 'All Bookings', subtitle: 'You booked 99 times' },
  { key: 'cleaning', label: 'Home Cleaning', subtitle: 'You booked 18 times' },
  { key: 'salon', label: "Women's Salon" },
];

describe('TabGroup', () => {
  it('renders every tab title and subtitle', () => {
    renderWithTheme(<TabGroup items={items} activeKey="all" />);
    expect(screen.getByText('All Bookings')).toBeInTheDocument();
    expect(screen.getByText('Home Cleaning')).toBeInTheDocument();
    expect(screen.getByText('You booked 99 times')).toBeInTheDocument();
  });

  it('marks the active tab as selected via its accessible name', () => {
    renderWithTheme(<TabGroup items={items} activeKey="cleaning" />);
    const tab = screen.getByRole('button', { name: 'Home Cleaning, You booked 18 times' });
    expect(tab).toBeInTheDocument();
  });

  it('fires onChange with the tapped tab key', () => {
    const onChange = vi.fn();
    renderWithTheme(<TabGroup items={items} activeKey="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: "Women's Salon" }));
    expect(onChange).toHaveBeenCalledWith('salon');
  });

  it('renders and fires onChange in the scrollable slider layout', () => {
    const onChange = vi.fn();
    renderWithTheme(<TabGroup scrollable items={items} activeKey="all" onChange={onChange} />);
    expect(screen.getByText('All Bookings')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: "Women's Salon" }));
    expect(onChange).toHaveBeenCalledWith('salon');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<TabGroup items={items} activeKey="all" onChange={() => {}} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
