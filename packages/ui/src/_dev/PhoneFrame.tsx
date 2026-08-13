import { useEffect, useState, type ReactNode } from 'react';
import { View } from 'react-native';

/**
 * The simulated status-bar/notch inset every screen story passes as `safeAreaTop` — ONE shared value so
 * all story titles land at the same Y (AGENTS #38). Preview-only: on device the real inset comes from
 * `useSafeAreaInsets()`. (The home-cleaning funnel intentionally uses its own taller 69 for the Dynamic
 * Island.)
 */
export const SAFE_TOP = 54;

/**
 * Dev-only full-bleed phone frame for screen stories (e.g. the Home-Cleaning funnel and the
 * post-checkout Thank-You screen). NOT part of the public API — it's preview infrastructure, not a
 * shipped component, so it lives in `_dev/` and isn't re-exported from `index.ts`.
 *
 * A `position: fixed` full-screen wrapper that fills the viewport so a screen behaves like a real
 * device: the screen's own inner scroll owns the gesture and the frame itself never moves — except to
 * follow the iOS soft keyboard.
 *
 * Why measure the visual viewport at all? Two iOS-standalone ("Add to Home Screen") quirks:
 *
 * 1. First-paint bottom bug — a `position:fixed; bottom:0` element resolves its bottom against the
 *    **layout viewport**, which is ~40px SHORT of the true visual viewport until the first scroll
 *    forces a reflow, so on open the floating bottom bar sat ~40px too high and only dropped into place
 *    after a scroll. We therefore drive the no-keyboard height from CSS — the `[data-phone-frame]` rule
 *    in `preview-head.html` (`height:100vh; height:100dvh`), a cascade RNW's single inline value can't
 *    express: `100vh` keeps the wrapper full-screen even without `dvh` (iOS < 15.4, where a lone
 *    `100dvh` is dropped and the fixed element collapses to content height); `100dvh` overrides on
 *    supporting engines to reach the PHYSICAL bottom *under* the home indicator for full bottom bleed
 *    (`viewport-fit=cover`). `visualViewport.height` EXCLUDES that home-indicator strip on a standalone
 *    iOS app — which left the floating bar hovering with a gap — so we deliberately do NOT use it for
 *    the no-keyboard height (no inline height in that state ⇒ the CSS rule wins).
 * 2. Keyboard — when the iOS keyboard opens it both shrinks the visual viewport AND scrolls the page,
 *    but `position:fixed` follows the *layout* viewport, so bottom sheets appeared to fly to the top.
 *    ONLY when the keyboard is up do we pin the wrapper to the *measured* visual-viewport height (an
 *    inline height that overrides the CSS rule) and translate by `offsetTop`, re-pinning it over the
 *    visible area and keeping a sheet anchored just above the keyboard.
 *
 * We re-measure as the standalone viewport settles (a rAF, staged ticks, and viewport/resize/
 * orientation events) so the bottom edge lands correctly on first paint. `data-phone-frame` (set via
 * RNW's `dataSet`) is what the CSS rule targets.
 */
export function Phone({ children }: { children: ReactNode }) {
  const [vp, setVp] = useState<{ height: number; offsetTop: number; layoutH: number } | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    const measure = () =>
      setVp({
        height: Math.round(vv?.height ?? window.innerHeight),
        offsetTop: Math.round(vv?.offsetTop ?? 0),
        // The layout viewport (doesn't shrink when the soft keyboard overlays) — the baseline we compare
        // the visual viewport against to detect the keyboard.
        layoutH: window.innerHeight,
      });
    measure();
    const raf = requestAnimationFrame(measure);
    const ticks = [50, 150, 400, 800].map((ms) => setTimeout(measure, ms));
    vv?.addEventListener('resize', measure);
    vv?.addEventListener('scroll', measure);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      cancelAnimationFrame(raf);
      ticks.forEach(clearTimeout);
      vv?.removeEventListener('resize', measure);
      vv?.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, []);
  // Keyboard up ⟺ the visual viewport shrank/shifted below the layout viewport. ONLY then do we pin the
  // wrapper to the measured visual viewport (+ translate) so the bottom sheets stay above the keyboard.
  const keyboardUp = !!vp && (vp.offsetTop > 1 || vp.height < vp.layoutH - 80);
  return (
    // `fixed` (not `absolute`) so the screen fills the viewport. Default (no keyboard): NO inline height —
    // the `[data-phone-frame]` CSS rule (preview-head.html) provides `height:100vh; height:100dvh`, the
    // cascade explained above. Only pin to the measured visual viewport (an inline height that overrides
    // the CSS rule) + translate when the keyboard is up, to keep sheets above it.
    <View
      {...({ dataSet: { phoneFrame: 'phone' } } as object)}
      style={{
        position: 'fixed' as unknown as 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        ...(keyboardUp ? { height: vp!.height, transform: [{ translateY: vp!.offsetTop }] as never } : null),
      }}
    >
      <View style={{ flex: 1, width: '100%', maxWidth: 430 }}>{children}</View>
    </View>
  );
}
