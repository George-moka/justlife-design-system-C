import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Text } from '../../primitives/Text';
import { Card } from './Card';

describe('Card', () => {
  it('renders its children', () => {
    renderWithTheme(
      <Card>
        <Text>Premium Cleaning</Text>
      </Card>,
    );
    expect(screen.getByText('Premium Cleaning')).toBeInTheDocument();
  });

  it('becomes pressable when onPress is provided', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <Card onPress={onPress}>
        <Text>Tap me</Text>
      </Card>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <Card>
        <Text>Accessible card</Text>
      </Card>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
