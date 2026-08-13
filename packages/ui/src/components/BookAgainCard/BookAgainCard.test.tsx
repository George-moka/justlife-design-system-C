import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { BookAgainCard, type BookAgainPro } from './BookAgainCard';

const pro: BookAgainPro = {
  name: 'Mary Mariel Jo',
  service: 'Home Cleaning',
  lastServed: 'Last served on Nov 14, 2025',
  category: 'clean',
  rating: '4.9',
  bookedCount: 9,
};

describe('BookAgainCard', () => {
  it('shows who they are, what they did and how often', () => {
    renderWithTheme(<BookAgainCard pro={pro} />);
    expect(screen.getByText('Mary Mariel Jo')).toBeInTheDocument();
    expect(screen.getByText('Home Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Last served on Nov 14, 2025')).toBeInTheDocument();
    expect(screen.getByText('Booked 9x')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
  });

  it('drops the optional tags when there is nothing to say', () => {
    renderWithTheme(<BookAgainCard pro={{ ...pro, rating: undefined, bookedCount: undefined }} />);
    expect(screen.queryByText('4.9')).not.toBeInTheDocument();
    expect(screen.queryByText(/^Booked/)).not.toBeInTheDocument();
  });

  it('rebooks on press', () => {
    const onPress = vi.fn();
    renderWithTheme(<BookAgainCard pro={pro} onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Book Mary Mariel Jo again' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('favouriting does not also rebook', () => {
    const onPress = vi.fn();
    const onFavorite = vi.fn();
    renderWithTheme(<BookAgainCard pro={pro} onPress={onPress} onFavorite={onFavorite} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Mary Mariel Jo to favourites' }));
    expect(onFavorite).toHaveBeenCalledOnce();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <BookAgainCard pro={pro} onPress={() => {}} onFavorite={() => {}} onShare={() => {}} />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
