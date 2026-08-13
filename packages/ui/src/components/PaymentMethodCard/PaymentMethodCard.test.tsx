import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { PaymentMethodCard } from './PaymentMethodCard';

describe('PaymentMethodCard', () => {
  it('renders title, number and trailing', () => {
    renderWithTheme(<PaymentMethodCard title="Visa" number="•••• 4242" trailing="Default" />);
    expect(screen.getByText('Visa')).toBeInTheDocument();
    expect(screen.getByText('•••• 4242')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('fires onPress', () => {
    const onPress = vi.fn();
    renderWithTheme(<PaymentMethodCard title="Cash" trailing="Selected" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cash' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows a radio in selectable mode and selects on press', () => {
    const onPress = vi.fn();
    renderWithTheme(<PaymentMethodCard title="Visa" number="•••• 4242" selected onPress={onPress} />);
    expect(screen.getByRole('radio')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Visa' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<PaymentMethodCard title="Visa" number="•••• 4242" trailing="Default" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
