import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Header } from './Header';

describe('Header', () => {
  it('renders the title', () => {
    renderWithTheme(<Header title="Home Cleaning" step={{ current: 1, total: 4 }} />);
    expect(screen.getByText('Home Cleaning')).toBeInTheDocument();
  });

  it('exposes the step progress as an accessible progressbar', () => {
    renderWithTheme(<Header title="Home Cleaning" step={{ current: 2, total: 4 }} />);
    expect(screen.getByRole('progressbar', { name: 'Step 2 of 4' })).toBeInTheDocument();
  });

  it('renders no progressbar when there is no step', () => {
    renderWithTheme(<Header title="Women's Salon" />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('fires onBack when the chevron is pressed', () => {
    const onBack = vi.fn();
    renderWithTheme(<Header title="Home Cleaning" onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('hides the back chevron when showBack is false', () => {
    renderWithTheme(<Header title="Home Cleaning" showBack={false} />);
    expect(screen.queryByRole('button', { name: 'Go back' })).not.toBeInTheDocument();
  });

  it('renders trailing actions and fires their handlers', () => {
    const onPress = vi.fn();
    renderWithTheme(
      <Header
        title="Women's Salon"
        actions={[{ icon: 'heart', accessibilityLabel: 'Save to favourites', onPress }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save to favourites' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <Header
        title="Home Cleaning"
        step={{ current: 1, total: 4 }}
        onBack={() => {}}
        actions={[{ icon: 'heart', accessibilityLabel: 'Save to favourites', tone: 'danger', filled: true }]}
      />,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
