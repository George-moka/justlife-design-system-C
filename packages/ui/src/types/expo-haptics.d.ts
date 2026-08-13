// Minimal ambient types for `expo-haptics` so @justlife/ui typechecks the NATIVE haptics helper
// (src/lib/haptics.ts). The real module is provided at runtime by the Expo app (apps/prototype, SDK 54 —
// bundled in Expo Go) and resolved by Metro; web + tests use haptics.web.ts and never import this module.
declare module 'expo-haptics' {
  export const ImpactFeedbackStyle: {
    Light: 'light';
    Medium: 'medium';
    Heavy: 'heavy';
    Soft: 'soft';
    Rigid: 'rigid';
  };
  export function impactAsync(style?: string): Promise<void>;
  export function selectionAsync(): Promise<void>;
}
