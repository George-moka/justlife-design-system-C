import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { InfoCard } from './InfoCard';

describe('InfoCard', () => {
  it('renders its message', () => {
    renderWithTheme(<InfoCard tone="warning">Be available 10 minutes early</InfoCard>);
    expect(screen.getByText('Be available 10 minutes early')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <InfoCard tone="success" icon="circle-check">
        Payment received
      </InfoCard>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
