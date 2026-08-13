import * as Haptics from 'expo-haptics';

/**
 * Fire a light "tap" haptic — used on tactile control interactions (e.g. the QuantityStepper +/−).
 * Fire-and-forget and failure-safe: never blocks the UI and never throws if haptics are unavailable.
 * Native (Expo) only; the web build resolves `haptics.web.ts`, a no-op.
 */
export function hapticTap(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
