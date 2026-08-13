import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Text } from '../../primitives/Text';
import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('renders the title and content when open', () => {
    renderWithTheme(
      <BottomSheet title="Payment Method">
        <Text>Mastercard •••• 6409</Text>
      </BottomSheet>,
    );
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    expect(screen.getByText('Mastercard •••• 6409')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    renderWithTheme(
      <BottomSheet title="Payment Method" open={false}>
        <Text>Hidden</Text>
      </BottomSheet>,
    );
    expect(screen.queryByText('Payment Method')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('fires onClose from the close button', () => {
    const onClose = vi.fn();
    renderWithTheme(<BottomSheet title="X" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('fires onClose when the scrim is tapped', () => {
    const onClose = vi.fn();
    renderWithTheme(<BottomSheet title="X" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('can hide the close button and grabber', () => {
    renderWithTheme(<BottomSheet title="X" showClose={false} showGrabber={false} />);
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('renders a footer slot', () => {
    renderWithTheme(<BottomSheet title="X" footer={<Text>Apply</Text>} />);
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <BottomSheet title="Payment Method" onClose={() => {}} footer={<Text>Apply</Text>}>
        <Text>Body</Text>
      </BottomSheet>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it('renders a step header: back chevron, and a titleAction that replaces the close button', () => {
    const onBack = vi.fn();
    renderWithTheme(
      <BottomSheet title="Select a country" onBack={onBack} titleAction={<Text>flag</Text>} divider>
        body
      </BottomSheet>,
    );
    // The trailing slot owns the corner — a sheet shows one trailing affordance, not two.
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    expect(screen.getByText('flag')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
