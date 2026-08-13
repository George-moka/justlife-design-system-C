import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { MiniActionCard } from './MiniActionCard';

describe('MiniActionCard', () => {
  it('renders the default state (label + action) and fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(<MiniActionCard label="Voucher Code" action="Add" onPress={onPress} />);
    expect(screen.getByText('Voucher Code')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the applied state (value + ✕) and fires onRemove', () => {
    const onRemove = vi.fn();
    renderWithTheme(
      <MiniActionCard label="Voucher Code" value="JL-WELCOME20" onRemove={onRemove} removeLabel="Remove voucher" />,
    );
    expect(screen.getByText('JL-WELCOME20')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove voucher' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <MiniActionCard label="Voucher Code" value="JL-WELCOME20" onRemove={() => {}} removeLabel="Remove voucher" />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
