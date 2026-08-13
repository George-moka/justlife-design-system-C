import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { VoucherCodeCard } from './VoucherCodeCard';

describe('VoucherCodeCard', () => {
  it('default state shows an Add link that fires onAdd', () => {
    const onAdd = vi.fn();
    renderWithTheme(<VoucherCodeCard title="Voucher Code" onAdd={onAdd} />);
    expect(screen.getByText('Voucher Code')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('applied state shows the code, discount and remove control', () => {
    const onRemove = vi.fn();
    renderWithTheme(
      <VoucherCodeCard title="Voucher Code" applied code="BOTIM432" discountLabel="20% off" onRemove={onRemove} />,
    );
    expect(screen.getByText('BOTIM432')).toBeInTheDocument();
    expect(screen.getByText('20% off')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove voucher' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <VoucherCodeCard title="Voucher Code" applied code="BOTIM432" discountLabel="20% off" />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
