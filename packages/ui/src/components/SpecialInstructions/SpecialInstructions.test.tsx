import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { SpecialInstructions } from './SpecialInstructions';

describe('SpecialInstructions', () => {
  it('shows an Add action when empty', () => {
    const onPressAction = vi.fn();
    renderWithTheme(<SpecialInstructions title="Add special instructions" onPressAction={onPressAction} />);
    expect(screen.getByText('Add special instructions')).toBeInTheDocument();
    const action = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(action);
    expect(onPressAction).toHaveBeenCalledTimes(1);
  });

  it('shows the value and an Edit action when filled', () => {
    renderWithTheme(<SpecialInstructions title="Special instructions" value="Leave at the door" />);
    expect(screen.getByText('Leave at the door')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <SpecialInstructions title="Special instructions" value="Leave at the door" />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
