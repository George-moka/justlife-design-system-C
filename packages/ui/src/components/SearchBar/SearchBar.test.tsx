import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders the placeholder and fires onChangeText while typing', () => {
    const onChangeText = vi.fn();
    renderWithTheme(<SearchBar value="" onChangeText={onChangeText} placeholder="Search services" />);
    const input = screen.getByPlaceholderText('Search services');
    fireEvent.change(input, { target: { value: 'clean' } });
    expect(onChangeText).toHaveBeenCalledWith('clean');
  });

  it('hides the clear button when empty', () => {
    renderWithTheme(<SearchBar value="" onChangeText={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('clears the value when the clear button is pressed', () => {
    const onChangeText = vi.fn();
    renderWithTheme(<SearchBar value="deep clean" onChangeText={onChangeText} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChangeText).toHaveBeenCalledWith('');
  });

  it('calls onClear instead of clearing when provided', () => {
    const onChangeText = vi.fn();
    const onClear = vi.fn();
    renderWithTheme(<SearchBar value="deep clean" onChangeText={onChangeText} onClear={onClear} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onChangeText).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<SearchBar value="deep clean" onChangeText={() => {}} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
