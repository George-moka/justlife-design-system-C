import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { ReviewCard } from './ReviewCard';

describe('ReviewCard', () => {
  it('renders reviewer name, rating, meta and review', () => {
    renderWithTheme(
      <ReviewCard
        reviewerName="Sarah M."
        rating="5.0"
        meta="May 15, 2026 • For 1.5 hours"
        review="Excellent service!"
      />,
    );
    expect(screen.getByText('Sarah M.')).toBeInTheDocument();
    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(screen.getByText('May 15, 2026 • For 1.5 hours')).toBeInTheDocument();
    expect(screen.getByText('Excellent service!')).toBeInTheDocument();
  });

  it('exposes an accessible rating label', () => {
    renderWithTheme(<ReviewCard reviewerName="Omar K." rating="4.5" review="Great." />);
    expect(screen.getByLabelText('Rated 4.5')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <ReviewCard reviewerName="Leila A." rating="5.0" meta="May 10, 2026" review="Spotless work." />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
