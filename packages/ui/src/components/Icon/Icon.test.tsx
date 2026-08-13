import { describe, it, expect } from 'vitest';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Icon } from './Icon';
import { brandGlyphs } from './brand-glyphs';

describe('Icon', () => {
  it('renders a Lucide glyph by name', () => {
    const { container } = renderWithTheme(<Icon name="star" label="Star" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders a BRAND glyph (Figma-extracted) in preference to Lucide', () => {
    const { container } = renderWithTheme(<Icon name="instant-bolt" label="Instant" />);
    const path = container.querySelector('svg path');
    expect(path).toBeInTheDocument();
    // The exact Figma path — proves we draw the brand bolt, not Lucide's chunkier `zap`.
    expect(path?.getAttribute('d')).toBe(brandGlyphs['instant-bolt'].path);
  });

  it('colours a brand glyph with the icon colour (fill, since it is a solid path)', () => {
    const { container } = renderWithTheme(<Icon name="instant-bolt" color="#123456" label="Instant" />);
    expect(container.querySelector('svg path')?.getAttribute('fill')).toBe('#123456');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<Icon name="instant-bolt" label="Instant" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
