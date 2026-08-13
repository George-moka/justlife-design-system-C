import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { TimeSlotPicker } from './TimeSlotPicker';

const SLOTS = ['12:30 – 13:00', '13:00 – 13:30', '13:30 – 14:00'];

describe('TimeSlotPicker', () => {
  it('renders the slots', () => {
    renderWithTheme(<TimeSlotPicker slots={SLOTS} value={SLOTS[0]} onChange={() => {}} />);
    expect(screen.getByText('13:00 – 13:30')).toBeInTheDocument();
  });

  it('fires onChange with the tapped slot', () => {
    const onChange = vi.fn();
    renderWithTheme(<TimeSlotPicker slots={SLOTS} value={SLOTS[0]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '13:30 – 14:00' }));
    expect(onChange).toHaveBeenCalledWith('13:30 – 14:00');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<TimeSlotPicker slots={SLOTS} value={SLOTS[0]} onChange={() => {}} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
