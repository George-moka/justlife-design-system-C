import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Disclaimer } from './Disclaimer';

describe('Disclaimer', () => {
  it('renders the message', () => {
    renderWithTheme(<Disclaimer>Free cancellation up to 6 hours before.</Disclaimer>);
    expect(screen.getByText('Free cancellation up to 6 hours before.')).toBeInTheDocument();
  });

  it('fires the action link', () => {
    const onPress = vi.fn();
    renderWithTheme(<Disclaimer action={{ label: 'Details', onPress }}>Policy applies.</Disclaimer>);
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders no link when action is omitted', () => {
    renderWithTheme(<Disclaimer>Prices include VAT.</Disclaimer>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <Disclaimer action={{ label: 'Details', onPress: () => {} }}>Free cancellation applies.</Disclaimer>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
