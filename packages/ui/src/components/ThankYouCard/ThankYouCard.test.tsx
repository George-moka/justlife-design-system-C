import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { ThankYouCard } from './ThankYouCard';

describe('ThankYouCard', () => {
  it('renders title, message and professional', () => {
    renderWithTheme(
      <ThankYouCard
        title="Professional Assigned"
        message="Leila will arrive soon."
        professional={{ name: 'Leila Mary', rating: 4.7 }}
      />,
    );
    expect(screen.getByText('Professional Assigned')).toBeInTheDocument();
    expect(screen.getByText('Leila will arrive soon.')).toBeInTheDocument();
    expect(screen.getByText('Leila Mary')).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
  });

  it('makes the title pressable when onPress is set', () => {
    const onPress = vi.fn();
    renderWithTheme(<ThankYouCard title="Booking Confirmed" message="Done." onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Booking Confirmed' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders pill actions and fires them', () => {
    const onReschedule = vi.fn();
    renderWithTheme(
      <ThankYouCard
        title="Assigned"
        message="Soon."
        actions={[{ label: 'Reschedule', icon: 'calendar', onPress: onReschedule }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reschedule' }));
    expect(onReschedule).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <ThankYouCard
        title="Professional Assigned"
        message="Leila will arrive soon."
        professional={{ name: 'Leila Mary', rating: 4.7 }}
        onPress={() => {}}
        actions={[{ label: 'Reschedule', icon: 'calendar', onPress: () => {} }]}
      />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
