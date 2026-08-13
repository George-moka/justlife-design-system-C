import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label', () => {
    renderWithTheme(<Button>Book now</Button>);
    expect(screen.getByRole('button', { name: 'Book now' })).toBeInTheDocument();
  });

  it('calls onPress when pressed', () => {
    const onPress = vi.fn();
    renderWithTheme(<Button onPress={onPress}>Tap</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Tap' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('recolours the label by tone', () => {
    renderWithTheme(
      <Button variant="pill" tone="danger">
        Cancel
      </Button>,
    );
    // danger tone → text.error (#D42222)
    expect(getComputedStyle(screen.getByText('Cancel')).color).toBe('rgb(212, 34, 34)');
  });

  it('does not call onPress when disabled', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <Button onPress={onPress} disabled>
        Tap
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tap' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress while loading', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <Button onPress={onPress} loading accessibilityLabel="Submit">
        Submit
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<Button>Accessible</Button>);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
