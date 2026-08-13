import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Text } from '../Text';
import { EdgeSwipeBack } from './EdgeSwipeBack';

describe('EdgeSwipeBack', () => {
  it('renders the screen it wraps', () => {
    renderWithTheme(
      <EdgeSwipeBack onBack={() => {}}>
        <Text>Funnel</Text>
      </EdgeSwipeBack>,
    );
    expect(screen.getByText('Funnel')).toBeInTheDocument();
  });

  it('never goes back on its own', () => {
    const onBack = vi.fn();
    renderWithTheme(
      <EdgeSwipeBack onBack={onBack}>
        <Text>Funnel</Text>
      </EdgeSwipeBack>,
    );
    expect(onBack).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <EdgeSwipeBack onBack={() => {}}>
        <Text>Funnel</Text>
      </EdgeSwipeBack>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
