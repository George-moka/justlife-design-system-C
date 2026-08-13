import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Avatar, toInitials } from './Avatar';

describe('Avatar', () => {
  it('derives initials from a full name', () => {
    expect(toInitials('Cem Mirkelam')).toBe('CM');
    expect(toInitials('Sara')).toBe('SA');
    expect(toInitials(undefined, 'jl')).toBe('JL');
    expect(toInitials('')).toBe('');
  });

  it('renders the initials', () => {
    renderWithTheme(<Avatar name="Cem Mirkelam" />);
    expect(screen.getByText('CM')).toBeInTheDocument();
  });

  it('exposes the name as an accessible image label', () => {
    renderWithTheme(<Avatar name="Cem Mirkelam" />);
    expect(screen.getByRole('img', { name: 'Cem Mirkelam' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<Avatar name="Cem Mirkelam" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
