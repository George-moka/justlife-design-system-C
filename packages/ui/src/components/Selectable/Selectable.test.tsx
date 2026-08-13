import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Selectable } from './Selectable';
import { Text } from '../../primitives/Text';

describe('Selectable', () => {
  it('renders children', () => {
    renderWithTheme(
      <Selectable selected onPress={() => {}}>
        <Text>Weekly</Text>
      </Selectable>,
    );
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <Selectable selected={false} onPress={onPress} accessibilityLabel="Monday">
        <Text>M</Text>
      </Selectable>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Monday' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <Selectable disabled onPress={onPress} accessibilityLabel="Monday">
        <Text>M</Text>
      </Selectable>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Monday' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <Selectable selected onPress={() => {}} accessibilityLabel="Tuesday">
        <Text>T</Text>
      </Selectable>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
