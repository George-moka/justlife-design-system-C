import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { BookCard } from './BookCard';

describe('BookCard', () => {
  it('renders title, details and price', () => {
    renderWithTheme(
      <BookCard title="Summer Ready Combo" details="Deep cleaning" price="100" oldPrice="399" />,
    );
    expect(screen.getByText('Summer Ready Combo')).toBeInTheDocument();
    expect(screen.getByText('Deep cleaning')).toBeInTheDocument();
    expect(screen.getByText('AED 100')).toBeInTheDocument();
    expect(screen.getByText('AED 399')).toBeInTheDocument();
  });

  it('hides details in the small size', () => {
    renderWithTheme(<BookCard size="small" title="AC Filter Cleaning" details="hidden" price="100" />);
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  });

  it('renders the professional row and fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <BookCard
        title="Home Deep Clean"
        price="100"
        professional={{ name: 'Leila', rating: '4.7' }}
        onPress={onPress}
      />,
    );
    expect(screen.getByText('Leila')).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <BookCard
        title="Home Deep Clean"
        details="Recommended for you"
        price="100"
        oldPrice="399"
        professional={{ name: 'Leila', rating: '4.7' }}
      />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
