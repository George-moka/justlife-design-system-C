/**
 * Web build of {@link hapticTap} — a no-op. Browsers have no haptic engine, and the native module
 * (`expo-haptics`) must never be bundled for web/tests. Mirrors `haptics.ts` so components can import it
 * platform-agnostically.
 */
export function hapticTap(): void {}
