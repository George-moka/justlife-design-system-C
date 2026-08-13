import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider } from '../theme/ThemeProvider';
import { useNavShrink } from './useNavShrink';

const wrapper = ({ children }: { children: React.ReactNode }) => <ThemeProvider>{children}</ThemeProvider>;
// Minimal RN scroll event — only the contentOffset.y the hook reads.
const scrollTo = (y: number) => ({ nativeEvent: { contentOffset: { y } } }) as never;

describe('useNavShrink', () => {
  it('stays expanded at the top and shrinks once scrolled past the threshold (size.12 = 12px)', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useNavShrink(onChange), { wrapper });
    expect(result.current.compact).toBe(false);

    act(() => result.current.onScroll(scrollTo(8))); // below 12 → still expanded
    expect(result.current.compact).toBe(false);
    expect(onChange).not.toHaveBeenCalled();

    act(() => result.current.onScroll(scrollTo(40))); // past 12 → compact
    expect(result.current.compact).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(true);

    act(() => result.current.onScroll(scrollTo(0))); // back to top → expanded
    expect(result.current.compact).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('fires onChange only when the flag flips, not on every scroll frame', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useNavShrink(onChange), { wrapper });
    act(() => result.current.onScroll(scrollTo(40)));
    act(() => result.current.onScroll(scrollTo(60))); // still compact — no extra call
    act(() => result.current.onScroll(scrollTo(200)));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
