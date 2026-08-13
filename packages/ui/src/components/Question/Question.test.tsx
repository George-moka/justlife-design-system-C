import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Question } from './Question';
import { Text } from '../../primitives/Text';

describe('Question', () => {
  it('renders the title and children', () => {
    renderWithTheme(
      <Question title="When would you like your service?">
        <Text>picker</Text>
      </Question>,
    );
    expect(screen.getByText('When would you like your service?')).toBeInTheDocument();
    expect(screen.getByText('picker')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <Question title="Service fee" info>
        <Text>AED 9.00</Text>
      </Question>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
