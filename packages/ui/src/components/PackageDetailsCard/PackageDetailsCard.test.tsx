import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { PackageDetailsCard } from './PackageDetailsCard';

describe('PackageDetailsCard', () => {
  it('renders title, description and remaining pill', () => {
    renderWithTheme(
      <PackageDetailsCard
        title="Package Details"
        description="90 mins Massage Package (4 sessions)"
        remaining="2 of 4 sessions left"
      />,
    );
    expect(screen.getByText('Package Details')).toBeInTheDocument();
    expect(screen.getByText('90 mins Massage Package (4 sessions)')).toBeInTheDocument();
    expect(screen.getByText('2 of 4 sessions left')).toBeInTheDocument();
  });

  it('hides the remaining pill when expired', () => {
    renderWithTheme(
      <PackageDetailsCard
        title="Package Expired"
        description="90 mins Massage Package"
        remaining="2 of 4 sessions left"
        state="expired"
      />,
    );
    expect(screen.queryByText('2 of 4 sessions left')).not.toBeInTheDocument();
  });

  it('fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(<PackageDetailsCard title="Package" description="Desc" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Package' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <PackageDetailsCard
        title="Package Details"
        description="90 mins Massage Package (4 sessions)"
        remaining="2 of 4 sessions left"
        onPress={() => {}}
      />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
