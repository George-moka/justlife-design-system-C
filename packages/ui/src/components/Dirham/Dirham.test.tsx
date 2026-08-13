import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Dirham, AED_FONT_FAMILY, AED_TEXT } from './Dirham';

describe('Dirham', () => {
  it('renders the "AED" text (the symbol font collapses it to the glyph; readable fallback otherwise)', () => {
    renderWithTheme(<Dirham />);
    const el = screen.getByLabelText('AED');
    expect(el).toHaveTextContent(AED_TEXT);
  });

  it('exposes the registration contract each platform loads the font under', () => {
    // RNW emits styles as generated classes (not inline), so the family/weight themselves are asserted
    // visually in Storybook; here we pin the CONTRACT: the family name platforms must register, and the
    // exact text whose glyphs the font collapses into the symbol.
    expect(AED_FONT_FAMILY).toBe('aed');
    expect(AED_TEXT).toBe('AED');
    renderWithTheme(<Dirham variant="headlineSmall" color="promoDark" />);
    expect(screen.getByLabelText('AED')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<Dirham />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
