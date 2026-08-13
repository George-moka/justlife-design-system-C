import React, { createContext, useContext, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { defaultThemeName, themes, type ThemeName, type Tokens } from '@justlife/tokens';

interface ThemeContextValue {
  theme: Tokens;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Control the active theme. When provided the provider is controlled. */
  themeName?: ThemeName;
  /** Initial theme when uncontrolled. */
  defaultTheme?: ThemeName;
}

export function ThemeProvider({ children, themeName, defaultTheme }: ThemeProviderProps) {
  const [internal, setInternal] = useState<ThemeName>(defaultTheme ?? defaultThemeName);
  const name = themeName ?? internal;

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: themes[name], themeName: name, setThemeName: setInternal }),
    [name],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme/useStyles must be used within a <ThemeProvider>.');
  }
  return ctx;
}

/** Access the active resolved token set. */
export function useTheme(): Tokens {
  return useThemeContext().theme;
}

export function useThemeName(): ThemeName {
  return useThemeContext().themeName;
}

/**
 * Build a memoised StyleSheet from the active theme.
 *
 *   const styles = useStyles((t) => ({ box: { backgroundColor: t.background.surface } }));
 */
export function useStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Tokens) => T & StyleSheet.NamedStyles<T>,
): T {
  const theme = useTheme();
  // Recompute only when the theme changes; the factory is treated as stable.
  return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
}
