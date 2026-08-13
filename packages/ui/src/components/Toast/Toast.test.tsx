import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Toast } from './Toast';
import { ToastProvider, useToast } from './ToastProvider';
import { Pressable } from 'react-native';
import { Text } from '../../primitives/Text';

describe('Toast', () => {
  it('renders the message', () => {
    renderWithTheme(<Toast message="Booking confirmed" />);
    expect(screen.getByText('Booking confirmed')).toBeInTheDocument();
  });

  it('shows a ✕ by default (no action) and fires onDismiss', () => {
    const onDismiss = vi.fn();
    renderWithTheme(<Toast message="Saved" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders an action and fires it; hides the ✕ when an action is present', () => {
    const onPress = vi.fn();
    renderWithTheme(<Toast message="Address removed" action={{ label: 'Undo', onPress }} />);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('marks an error toast as an alert region', () => {
    renderWithTheme(<Toast message="Network error" tone="error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders nothing while closed', () => {
    renderWithTheme(<Toast message="Hidden" open={false} />);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <Toast message="Booking confirmed" tone="success" action={{ label: 'View', onPress: () => {} }} />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('useToast / ToastProvider', () => {
  function Trigger() {
    const toast = useToast();
    return (
      <Pressable accessibilityRole="button" onPress={() => toast.success('Booking confirmed')}>
        <Text>fire</Text>
      </Pressable>
    );
  }

  it('shows a toast via the imperative API', () => {
    renderWithTheme(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    expect(screen.queryByText('Booking confirmed')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'fire' }));
    expect(screen.getByText('Booking confirmed')).toBeInTheDocument();
  });

  it('throws when used outside a provider', () => {
    const Bad = () => {
      useToast();
      return null;
    };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderWithTheme(<Bad />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
