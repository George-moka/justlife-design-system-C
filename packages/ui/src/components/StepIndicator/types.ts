export interface StepIndicatorProps {
  /** Current step, 1-based. */
  current: number;
  /** Total number of steps. */
  total: number;
  /** Diameter in px. Defaults to `size.28` (28). */
  size?: number;
}
