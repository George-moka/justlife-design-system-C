import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its label', () => {
    renderWithTheme(<Badge tone="success">Save 33%</Badge>);
    expect(screen.getByText('Save 33%')).toBeInTheDocument();
  });

  it('renders with an icon and an accessible label', () => {
    renderWithTheme(
      <Badge tone="rating" icon="star" iconFilled accessibilityLabel="Rated 5.0">
        5.0
      </Badge>,
    );
    expect(screen.getByLabelText('Rated 5.0')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<Badge tone="neutral">New</Badge>);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('renders the tint tones with a same-hue label (and an accent icon on `instant`)', () => {
    const { container } = renderWithTheme(
      <Badge tone="instant" icon="instant-bolt">
        30 Mins
      </Badge>,
    );
    // Soft yellow tint + deep amber label (9.4:1) — the ribbon that sits ON a service tile.
    const pill = container.querySelector('div');
    expect(getComputedStyle(pill!).backgroundColor).toBe('rgb(255, 248, 214)');
    expect(screen.getByText('30 Mins')).toBeInTheDocument();
  });

  it('supports the subtle success tone', () => {
    const { container } = renderWithTheme(<Badge tone="successSubtle">40% Off</Badge>);
    expect(getComputedStyle(container.querySelector('div')!).backgroundColor).toBe('rgb(244, 255, 224)');
  });
});
