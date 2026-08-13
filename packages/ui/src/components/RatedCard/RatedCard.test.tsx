import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { RatedCard } from './RatedCard';

describe('RatedCard', () => {
  it('renders the title and rating label', () => {
    renderWithTheme(<RatedCard title="You Rated Leila" ratingLabel="Your rating" rating={5} />);
    expect(screen.getByText('You Rated Leila')).toBeInTheDocument();
    expect(screen.getByText('Your rating')).toBeInTheDocument();
    expect(screen.getByLabelText('5 out of 5 stars')).toBeInTheDocument();
  });

  it('shows the tip amount in the Tip state', () => {
    renderWithTheme(<RatedCard title="You Rated Leila" rating={4} tipLabel="Tip added" tipAmount="10" />);
    expect(screen.getByText('Tip added')).toBeInTheDocument();
    expect(screen.getByText('AED 10')).toBeInTheDocument();
  });

  it('renders the Add Tip button and fires onAddTip', () => {
    const onAddTip = vi.fn();
    renderWithTheme(<RatedCard title="You Rated Leila" rating={5} onAddTip={onAddTip} />);
    const button = screen.getByRole('button', { name: 'Add Tip' });
    fireEvent.click(button);
    expect(onAddTip).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <RatedCard title="You Rated Leila" ratingLabel="Your rating" rating={4} tipLabel="Tip added" tipAmount="10" />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
