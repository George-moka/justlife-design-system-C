import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { PlanSelectCard } from './PlanSelectCard';
import { Text } from '../../primitives/Text';

describe('PlanSelectCard', () => {
  it('renders title, discount, popular ribbon and bullets', () => {
    renderWithTheme(
      <PlanSelectCard
        selected
        onPress={() => {}}
        title="Recurring"
        discount="Save up to 25%"
        popular
        bullets={['Same professional guaranteed', 'Pause or cancel anytime']}
      />,
    );
    expect(screen.getByText('Recurring')).toBeInTheDocument();
    expect(screen.getByText('Save up to 25%')).toBeInTheDocument();
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
    expect(screen.getByText('Same professional guaranteed')).toBeInTheDocument();
  });

  it('fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(<PlanSelectCard selected={false} onPress={onPress} title="One Time" bullets={['Single visit']} />);
    fireEvent.click(screen.getByRole('button', { name: 'One Time' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders expanded children when provided', () => {
    renderWithTheme(
      <PlanSelectCard selected onPress={() => {}} title="Recurring" bullets={['x']}>
        <Text>expansion</Text>
      </PlanSelectCard>,
    );
    expect(screen.getByText('expansion')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <PlanSelectCard selected onPress={() => {}} title="Recurring" bullets={['Same professional guaranteed']} />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
