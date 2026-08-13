import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Text } from 'react-native';
import { renderWithTheme } from '../../test-utils';
import { SelectableCard } from './SelectableCard';

describe('SelectableCard', () => {
  it('renders children', () => {
    renderWithTheme(
      <SelectableCard>
        <Text>Row content</Text>
      </SelectableCard>,
    );
    expect(screen.getByText('Row content')).toBeInTheDocument();
  });

  it('is a button and fires onPress when pressable', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <SelectableCard onPress={onPress} accessibilityLabel="Row">
        <Text>Row content</Text>
      </SelectableCard>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Row' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not become pressable when disabled', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <SelectableCard onPress={onPress} disabled accessibilityLabel="Row">
        <Text>Row content</Text>
      </SelectableCard>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <SelectableCard selected onPress={() => {}} accessibilityLabel="Row">
        <Text>Row content</Text>
      </SelectableCard>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
