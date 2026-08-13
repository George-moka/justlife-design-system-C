import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Skeleton, SkeletonText, SkeletonGroup } from './Skeleton';

describe('Skeleton', () => {
  it('renders a placeholder block', () => {
    renderWithTheme(<Skeleton testID="sk" height={16} width={120} />);
    expect(screen.getByTestId('sk')).toBeInTheDocument();
  });

  it('renders a static block when not animated', () => {
    renderWithTheme(<Skeleton testID="static" animated={false} />);
    expect(screen.getByTestId('static')).toBeInTheDocument();
  });
});

describe('SkeletonGroup', () => {
  it('exposes a single busy "Loading" region around the placeholders', () => {
    renderWithTheme(
      <SkeletonGroup>
        <Skeleton testID="a" />
        <Skeleton testID="b" />
      </SkeletonGroup>,
    );
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    expect(screen.getByTestId('a')).toBeInTheDocument();
    expect(screen.getByTestId('b')).toBeInTheDocument();
  });

  it('accepts a custom label', () => {
    renderWithTheme(
      <SkeletonGroup label="Loading bookings">
        <SkeletonText lines={3} />
      </SkeletonGroup>,
    );
    expect(screen.getByLabelText('Loading bookings')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <SkeletonGroup>
        <Skeleton circle height={40} width={40} />
        <SkeletonText lines={2} />
      </SkeletonGroup>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
