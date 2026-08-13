import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { ServiceCard } from './ServiceCard';

describe('ServiceCard', () => {
  it('renders title, duration, price, discount and Add CTA', () => {
    const onAdd = vi.fn();
    renderWithTheme(
      <ServiceCard
        title="Classic Mani-Pedi"
        duration="120 min"
        price="100"
        oldPrice="140"
        discountLabel="20% off"
        onAdd={onAdd}
      />,
    );
    expect(screen.getByText('Classic Mani-Pedi')).toBeInTheDocument();
    expect(screen.getByText('120 min')).toBeInTheDocument();
    expect(screen.getByText('AED 100')).toBeInTheDocument();
    expect(screen.getByText('AED 140')).toBeInTheDocument();
    expect(screen.getByText('20% off')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('shows the stepper once a quantity is added', () => {
    renderWithTheme(<ServiceCard title="Deep Cleaning" price="189" defaultQuantity={2} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeInTheDocument();
  });

  it('Add becomes the stepper on press', () => {
    renderWithTheme(<ServiceCard title="Classic Mani-Pedi" price="100" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('renders the included-items details panel', () => {
    renderWithTheme(
      <ServiceCard
        title="Gel Polish"
        price="40"
        details={{ heading: 'What is included', items: ['Classic Manicure', 'Classic Pedicure'] }}
      />,
    );
    expect(screen.getByText('What is included')).toBeInTheDocument();
    expect(screen.getByText('• Classic Manicure')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <ServiceCard title="Classic Mani-Pedi" duration="120 min" price="100" oldPrice="140" discountLabel="20% off" />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
