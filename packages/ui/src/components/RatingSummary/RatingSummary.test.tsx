import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { RatingSummary } from './RatingSummary';

describe('RatingSummary', () => {
  it('renders the rating and review count', () => {
    renderWithTheme(<RatingSummary rating="4.88" reviewCount="27K reviews" />);
    expect(screen.getByText('4.88')).toBeInTheDocument();
    expect(screen.getByText('27K reviews')).toBeInTheDocument();
  });

  it('hides the review count when omitted', () => {
    renderWithTheme(<RatingSummary rating="4.5" />);
    expect(screen.queryByText(/reviews/)).not.toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<RatingSummary rating="4.88" reviewCount="27K reviews" size="lg" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
