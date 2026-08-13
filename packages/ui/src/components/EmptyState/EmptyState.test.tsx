import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title and description', () => {
    renderWithTheme(
      <EmptyState title="No upcoming bookings" description="When you book a service, it’ll show up here." />,
    );
    expect(screen.getByText('No upcoming bookings')).toBeInTheDocument();
    expect(screen.getByText('When you book a service, it’ll show up here.')).toBeInTheDocument();
  });

  it('fires the action when its button is pressed', () => {
    const onPress = vi.fn();
    renderWithTheme(<EmptyState title="No favorites" action={{ label: 'Browse services', onPress }} />);
    fireEvent.click(screen.getByText('Browse services'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <EmptyState
        icon="wallet"
        title="Your wallet is empty"
        description="Add credit to pay faster."
        action={{ label: 'Add credit', onPress: () => {} }}
      />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
