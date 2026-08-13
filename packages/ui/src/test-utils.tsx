import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from './theme/ThemeProvider';
import type { ThemeName } from '@justlife/tokens';

/** Render a component tree wrapped in the design-system ThemeProvider. */
export function renderWithTheme(
  ui: React.ReactElement,
  options: { themeName?: ThemeName } & Omit<RenderOptions, 'wrapper'> = {},
): ReturnType<typeof render> {
  const { themeName, ...rest } = options;
  return render(ui, {
    wrapper: ({ children }) => <ThemeProvider themeName={themeName}>{children}</ThemeProvider>,
    ...rest,
  });
}
