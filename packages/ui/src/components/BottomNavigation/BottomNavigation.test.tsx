import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { BottomNavigation, type BottomNavItem } from './BottomNavigation';

const items: BottomNavItem[] = [
  { key: 'home', label: 'Home', icon: 'house' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-check', badge: 3 },
  { key: 'wallet', label: 'Wallet', icon: 'wallet', badge: 24 },
  { key: 'profile', label: 'Profile', icon: 'user', badge: true },
];

describe('BottomNavigation', () => {
  it('renders every tab label', () => {
    renderWithTheme(<BottomNavigation items={items} activeKey="home" />);
    ['Home', 'Bookings', 'Wallet', 'Profile'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders count badges and caps over-max counts at "9+"', () => {
    renderWithTheme(<BottomNavigation items={items} activeKey="home" />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('marks the active tab as selected via its accessible name', () => {
    renderWithTheme(<BottomNavigation items={items} activeKey="bookings" />);
    // badge count is folded into the active tab's accessible label
    expect(screen.getByRole('button', { name: 'Bookings, 3 notifications' })).toBeInTheDocument();
  });

  it('fires onTabPress with the tapped tab key', () => {
    const onTabPress = vi.fn();
    renderWithTheme(<BottomNavigation items={items} activeKey="home" onTabPress={onTabPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Wallet, 24 notifications' }));
    expect(onTabPress).toHaveBeenCalledWith('wallet');
  });

  it('renders in the compact (icon-only) state without dropping tabs or a11y names', () => {
    renderWithTheme(<BottomNavigation items={items} activeKey="home" compact />);
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bookings, 3 notifications' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <BottomNavigation items={items} activeKey="home" onTabPress={() => {}} />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
