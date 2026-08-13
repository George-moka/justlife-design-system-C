import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { StepIndicator } from './StepIndicator';

describe('StepIndicator', () => {
  it('renders the current step number', () => {
    renderWithTheme(<StepIndicator current={2} total={4} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('exposes an accessible step label', () => {
    renderWithTheme(<StepIndicator current={3} total={4} />);
    expect(screen.getByRole('img', { name: 'Step 3 of 4' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<StepIndicator current={1} total={4} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
