import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { ProfessionalCard } from './ProfessionalCard';

describe('ProfessionalCard', () => {
  it('renders the name and rating', () => {
    renderWithTheme(<ProfessionalCard category="heal" name="Leila Mary" photo="/p.png" rating={4.7} />);
    expect(screen.getByText('Leila Mary')).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
  });

  it('fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(<ProfessionalCard category="clean" name="Hussein" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Hussein' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders without a rating (no star badge)', () => {
    renderWithTheme(<ProfessionalCard category="clean" name="Hussein" />);
    expect(screen.getByText('Hussein')).toBeInTheDocument();
    expect(screen.queryByText('4.7')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <ProfessionalCard category="heal" name="Leila Mary" photo="/p.png" rating={4.7} onPress={() => {}} />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
