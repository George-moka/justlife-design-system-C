import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { PlanBookingCard } from './PlanBookingCard';

const rows = [
  { label: 'Package', value: '1 Month' },
  { label: 'Schedule', value: 'Every Mon', highlight: true },
];

describe('PlanBookingCard', () => {
  it('renders title, status, rows and professional', () => {
    renderWithTheme(
      <PlanBookingCard
        title="Cleaning Subscription"
        statusLabel="Active"
        statusTone="success"
        rows={rows}
        professional={{ name: 'Hussein', rating: 4.3 }}
      />,
    );
    expect(screen.getByText('Cleaning Subscription')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Package')).toBeInTheDocument();
    expect(screen.getByText('1 Month')).toBeInTheDocument();
    expect(screen.getByText('Hussein')).toBeInTheDocument();
    expect(screen.getByText('4.3')).toBeInTheDocument();
  });

  it('fires the footer button', () => {
    const onButtonPress = vi.fn();
    renderWithTheme(
      <PlanBookingCard
        title="Plan"
        statusLabel="Active"
        statusTone="success"
        rows={rows}
        buttonLabel="Manage Booking"
        buttonIcon="settings"
        onButtonPress={onButtonPress}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Manage Booking' }));
    expect(onButtonPress).toHaveBeenCalledTimes(1);
  });

  it('shows the user self-rating with an edit action', () => {
    const onEditRating = vi.fn();
    renderWithTheme(
      <PlanBookingCard
        title="Plan"
        statusLabel="Completed"
        statusTone="info"
        rows={rows}
        professional={{ name: 'Leila', rating: 4.7 }}
        userRating={5.0}
        onEditRating={onEditRating}
      />,
    );
    expect(screen.getByText('You rated')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit your rating' }));
    expect(onEditRating).toHaveBeenCalledTimes(1);
  });

  it('renders a discount badge when provided', () => {
    renderWithTheme(
      <PlanBookingCard title="Plan" statusLabel="Active" statusTone="success" rows={rows} discount="20% off" />,
    );
    expect(screen.getByText('20% off')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <PlanBookingCard
        title="Plan"
        statusLabel="Active"
        statusTone="success"
        rows={rows}
        professional={{ name: 'Hussein', rating: 4.3 }}
        buttonLabel="Manage"
        buttonIcon="settings"
      />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
