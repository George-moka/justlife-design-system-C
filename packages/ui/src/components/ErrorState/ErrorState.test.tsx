import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('renders default error copy', () => {
    renderWithTheme(<ErrorState />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows a Retry button only when onRetry is given, and fires it', () => {
    const onRetry = vi.fn();
    const { rerender } = renderWithTheme(<ErrorState />);
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    rerender(<ErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('accepts custom copy and retry label', () => {
    renderWithTheme(
      <ErrorState title="Couldn’t load your bookings" retryLabel="Try again" onRetry={() => {}} />,
    );
    expect(screen.getByText('Couldn’t load your bookings')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<ErrorState onRetry={() => {}} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
