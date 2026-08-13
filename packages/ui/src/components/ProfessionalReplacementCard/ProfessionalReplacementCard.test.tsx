import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { ProfessionalReplacementCard } from './ProfessionalReplacementCard';

const current = { name: 'Leila Mary', rating: 4.7, note: 'No longer available' };
const replacement = { name: 'Rihanna Karim', rating: 4.9, note: 'Your new professional' };

describe('ProfessionalReplacementCard', () => {
  it('renders both professionals and their notes', () => {
    renderWithTheme(<ProfessionalReplacementCard category="heal" current={current} replacement={replacement} />);
    expect(screen.getByText('Leila Mary')).toBeInTheDocument();
    expect(screen.getByText('Rihanna Karim')).toBeInTheDocument();
    expect(screen.getByText('No longer available')).toBeInTheDocument();
    expect(screen.getByText('Your new professional')).toBeInTheDocument();
  });

  it('omits the replacement row in the collapsed state', () => {
    renderWithTheme(<ProfessionalReplacementCard category="heal" current={current} />);
    expect(screen.getByText('Leila Mary')).toBeInTheDocument();
    expect(screen.queryByText('Rihanna Karim')).not.toBeInTheDocument();
  });

  it('fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <ProfessionalReplacementCard category="heal" current={current} replacement={replacement} onPress={onPress} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Leila Mary replaced by Rihanna Karim/ }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <ProfessionalReplacementCard category="heal" current={current} replacement={replacement} onPress={() => {}} />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
