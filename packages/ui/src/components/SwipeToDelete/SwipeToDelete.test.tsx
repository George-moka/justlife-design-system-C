import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Text } from '../../primitives/Text';
import { SwipeToDelete } from './SwipeToDelete';

describe('SwipeToDelete', () => {
  it('renders its row', () => {
    renderWithTheme(
      <SwipeToDelete onDelete={() => {}} deleteLabel="Remove Gel Mani-Pedi">
        <Text>Gel Mani-Pedi</Text>
      </SwipeToDelete>,
    );
    expect(screen.getByText('Gel Mani-Pedi')).toBeInTheDocument();
  });

  it('deletes only when the revealed action is pressed', () => {
    const onDelete = vi.fn();
    renderWithTheme(
      <SwipeToDelete open onDelete={onDelete} deleteLabel="Remove Gel Mani-Pedi">
        <Text>Gel Mani-Pedi</Text>
      </SwipeToDelete>,
    );
    // Pressing the row itself must never delete — that's the whole point of the two-step.
    fireEvent.click(screen.getByText('Gel Mani-Pedi'));
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Remove Gel Mani-Pedi' }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('closes itself after deleting', () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <SwipeToDelete open onOpenChange={onOpenChange} onDelete={() => {}} deleteLabel="Remove it">
        <Text>Row</Text>
      </SwipeToDelete>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove it' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <SwipeToDelete onDelete={() => {}} deleteLabel="Remove Gel Mani-Pedi">
        <Text>Gel Mani-Pedi</Text>
      </SwipeToDelete>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
