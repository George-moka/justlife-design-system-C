import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { AddressCard } from './AddressCard';

describe('AddressCard', () => {
  it('renders label, address and note', () => {
    renderWithTheme(
      <AddressCard label="Home" address="Villa 12, Jumeirah 1" note="Apartment / Villa" defaultBadge />,
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Villa 12, Jumeirah 1')).toBeInTheDocument();
    expect(screen.getByText('Apartment / Villa')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(<AddressCard label="Work" address="Downtown" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Work' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows a radio in selectable mode and selects on press', () => {
    const onPress = vi.fn();
    renderWithTheme(<AddressCard label="Home" address="Jumeirah 1" selected onPress={onPress} />);
    expect(screen.getByRole('radio')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fires edit and delete actions', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderWithTheme(
      <AddressCard label="Home" address="Jumeirah 1" onEdit={onEdit} onDelete={onDelete} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Edit Home' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete Home' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('renders a trailing action label and fires the row press (checkout "Change" form)', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <AddressCard label="Home" address="Jumeirah 1" trailing="Change" trailingTone="action" onPress={onPress} />,
    );
    expect(screen.getByText('Change')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <AddressCard label="Home" address="Jumeirah 1" defaultBadge selected />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
