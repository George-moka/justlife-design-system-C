import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { PillGroup } from './PillGroup';

const OPTIONS = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'biweekly', label: 'Every Two Weeks' },
];

describe('PillGroup', () => {
  it('renders the options', () => {
    renderWithTheme(<PillGroup options={OPTIONS} value="weekly" onChange={() => {}} />);
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Every Two Weeks')).toBeInTheDocument();
  });

  it('fires onChange with the tapped key', () => {
    const onChange = vi.fn();
    renderWithTheme(<PillGroup options={OPTIONS} value="weekly" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Every Two Weeks' }));
    expect(onChange).toHaveBeenCalledWith('biweekly');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<PillGroup options={OPTIONS} value="weekly" onChange={() => {}} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
