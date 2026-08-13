import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { ServiceTileRow } from './ServiceTileRow';

const TILES = [
  { label: 'Home Cleaning' },
  { label: 'AC Maintenance' },
  { label: 'Handyman' },
];

describe('ServiceTileRow', () => {
  it('renders the title and all tile labels', () => {
    renderWithTheme(<ServiceTileRow title="Popular services" tiles={TILES} />);
    expect(screen.getByText('Popular services')).toBeInTheDocument();
    expect(screen.getByText('Home Cleaning')).toBeInTheDocument();
    expect(screen.getByText('AC Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Handyman')).toBeInTheDocument();
  });

  it('fires onPress for a pressable tile', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <ServiceTileRow title="Popular services" tiles={[{ label: 'Home Cleaning', onPress }]} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Home Cleaning' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<ServiceTileRow title="Popular services" tiles={TILES} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
