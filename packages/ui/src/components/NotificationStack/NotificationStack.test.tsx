import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { NotificationStack, type NotificationItem } from './NotificationStack';

const ITEMS: NotificationItem[] = [
  { key: 'a', tone: 'danger', message: 'Update payment to renew your', emphasis: 'Cleaning Subscription.', onPress: () => {} },
  { key: 'b', tone: 'warning', message: 'You need to take action', emphasis: 'related to your booking.', onPress: () => {} },
  { key: 'c', tone: 'neutral', message: 'Due to poor weather conditions,', emphasis: 'bookings may be delayed.' },
];

describe('NotificationStack', () => {
  it('renders nothing when there are no notices', () => {
    const { container } = renderWithTheme(<NotificationStack items={[]} />);
    expect(container.textContent).toBe('');
  });

  it('shows only the top notice while collapsed, and counts the rest', () => {
    renderWithTheme(<NotificationStack items={ITEMS} />);
    expect(screen.getByText('Cleaning Subscription.')).toBeInTheDocument();
    expect(screen.queryByText('related to your booking.')).not.toBeInTheDocument();
    expect(screen.getByText('2 more')).toBeInTheDocument();
  });

  it('keeps the top notice tappable while collapsed — the deck does not swallow its press', () => {
    const onPress = vi.fn();
    renderWithTheme(<NotificationStack items={[{ ...ITEMS[0], onPress }, ITEMS[1]]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Update payment to renew your Cleaning Subscription.' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('expands to the full list and back', () => {
    renderWithTheme(<NotificationStack items={ITEMS} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show 2 more notifications' }));
    expect(screen.getByText('related to your booking.')).toBeInTheDocument();
    expect(screen.getByText('bookings may be delayed.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show fewer notifications' }));
    expect(screen.queryByText('related to your booking.')).not.toBeInTheDocument();
  });

  it('honours a controlled `expanded` and reports changes', () => {
    const onExpandedChange = vi.fn();
    renderWithTheme(<NotificationStack items={ITEMS} expanded onExpandedChange={onExpandedChange} />);
    expect(screen.getByText('bookings may be delayed.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show fewer notifications' }));
    expect(onExpandedChange).toHaveBeenCalledWith(false);
    // Still expanded — the parent owns the state.
    expect(screen.getByText('bookings may be delayed.')).toBeInTheDocument();
  });

  it('is a plain banner with no toggle when there is one notice', () => {
    renderWithTheme(<NotificationStack items={[ITEMS[0]]} />);
    expect(screen.queryByText(/more$/)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<NotificationStack items={ITEMS} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
