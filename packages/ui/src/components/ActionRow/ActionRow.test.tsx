import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { ActionRow } from './ActionRow';

describe('ActionRow', () => {
  it('renders the label and badge', () => {
    renderWithTheme(<ActionRow icon="banknote" label="Pay Pending Amount" badge="1" />);
    expect(screen.getByText('Pay Pending Amount')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(<ActionRow icon="receipt" label="Show Receipt" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show Receipt' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<ActionRow icon="pencil" label="Edit this booking only" onPress={() => {}} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
