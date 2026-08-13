import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { BookingStatusCard } from './BookingStatusCard';

describe('BookingStatusCard', () => {
  it('renders status, message and the professional block', () => {
    renderWithTheme(
      <BookingStatusCard
        status="Professional Assigned"
        message="We'll arrive between 13.00-14.00."
        professional={{ name: 'Leila Mary', rating: '4.7' }}
      />,
    );
    expect(screen.getByText('Professional Assigned')).toBeInTheDocument();
    expect(screen.getByText("We'll arrive between 13.00-14.00.")).toBeInTheDocument();
    expect(screen.getByText('Leila Mary')).toBeInTheDocument();
    expect(screen.getByLabelText('Rated 4.7')).toBeInTheDocument();
  });

  it('fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(<BookingStatusCard status="On the Way" message="On the way." onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'On the Way' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <BookingStatusCard
        status="Cancelled"
        message="This booking was cancelled."
        cancelled
        professional={{ name: 'Leila Mary', rating: '4.7' }}
      />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
