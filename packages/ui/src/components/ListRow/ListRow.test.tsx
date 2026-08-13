import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { ListRow } from './ListRow';

describe('ListRow', () => {
  it('renders label, value and badge', () => {
    renderWithTheme(<ListRow icon="credit-card" label="Payment Methods" value="Visa" badge={3} />);
    expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    expect(screen.getByText('Visa')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(<ListRow icon="user" label="Profile" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Profile' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('folds the badge count into the accessible label', () => {
    renderWithTheme(<ListRow icon="bell" label="Notifications" badge={3} onPress={() => {}} />);
    expect(screen.getByRole('button', { name: 'Notifications, 3' })).toBeInTheDocument();
  });

  it('renders a non-interactive row without onPress', () => {
    renderWithTheme(<ListRow icon="info" label="Version 4.2.0" showChevron={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Version 4.2.0')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<ListRow icon="settings" label="Settings" onPress={() => {}} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
