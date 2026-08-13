import { useWindowDimensions } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Current breakpoint derived from the viewport width and the breakpoint tokens.
 * Mobile-first: `base` is the smallest, then `sm` -> `xl`.
 */
export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  const { breakpoint } = useTheme();
  if (width >= breakpoint.xl) return 'xl';
  if (width >= breakpoint.lg) return 'lg';
  if (width >= breakpoint.md) return 'md';
  if (width >= breakpoint.sm) return 'sm';
  return 'base';
}

/** Pick a value for the current breakpoint, falling back to smaller ones. */
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const bp = useBreakpoint();
  const order: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'base'];
  const start = order.indexOf(bp);
  for (let i = start; i < order.length; i++) {
    const key = order[i];
    if (key in values) return values[key];
  }
  return undefined;
}
