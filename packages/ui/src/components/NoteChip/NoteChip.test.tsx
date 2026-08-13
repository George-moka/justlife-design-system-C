import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { NoteChip } from './NoteChip';

describe('NoteChip', () => {
  it('renders its label and toggles selection on press', () => {
    const onChange = vi.fn();
    renderWithTheme(<NoteChip onChange={onChange}>Pet at home</NoteChip>);
    const chip = screen.getByRole('button', { name: 'Pet at home' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(chip);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<NoteChip icon="bell-off">Quiet please</NoteChip>);
    expect((await axe(container)).violations).toEqual([]);
  });
});
