import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { NotificationBanner } from './NotificationBanner';

describe('NotificationBanner', () => {
  it('renders both text runs', () => {
    renderWithTheme(
      <NotificationBanner message="Update payment to renew your" emphasis="Cleaning Subscription." />,
    );
    expect(screen.getByText('Update payment to renew your')).toBeInTheDocument();
    expect(screen.getByText('Cleaning Subscription.')).toBeInTheDocument();
  });

  it('labels the tappable banner with the whole sentence, in reading order', () => {
    renderWithTheme(
      <NotificationBanner
        emphasisFirst
        emphasis="Juniper will serve you tomorrow."
        message="Home Cleaning, 08:00 - 08:30"
        onPress={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Juniper will serve you tomorrow. Home Cleaning, 08:00 - 08:30' }),
    ).toBeInTheDocument();
  });

  it('fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(<NotificationBanner message="Tap me" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tap me' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('renders a dismiss button only when dismissible, and it does not fire onPress', () => {
    const onPress = vi.fn();
    const onDismiss = vi.fn();
    renderWithTheme(<NotificationBanner message="New message" onPress={onPress} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('is not a button when it is a passive advisory', () => {
    renderWithTheme(<NotificationBanner message="Due to poor weather conditions," />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <NotificationBanner
        tone="danger"
        icon="triangle-alert"
        message="Update payment to renew your"
        emphasis="Cleaning Subscription."
        onPress={() => {}}
      />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
