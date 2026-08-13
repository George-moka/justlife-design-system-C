import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { NotificationCard } from './NotificationCard';

describe('NotificationCard', () => {
  it('renders title, body and time', () => {
    renderWithTheme(<NotificationCard title="Booking confirmed" body="See you tomorrow." time="2h ago" />);
    expect(screen.getByText('Booking confirmed')).toBeInTheDocument();
    expect(screen.getByText('See you tomorrow.')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(<NotificationCard title="Tap me" body="Body" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tap me' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('supports a selection checkbox', () => {
    const onCheckedChange = vi.fn();
    renderWithTheme(
      <NotificationCard title="N" body="B" showCheckbox onCheckedChange={onCheckedChange} />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select notification' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <NotificationCard title="Booking confirmed" body="See you tomorrow." time="2h ago" onPress={() => {}} />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
