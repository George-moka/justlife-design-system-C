/** Shared props for the platform-split country-flag chip. */
export interface FlagBadgeProps {
  /** ISO country code — "ae", "sa", "qa". */
  code: string;
  /** Circle diameter. */
  size: number;
  /** Brand ring (the selected country). */
  ring?: boolean;
  /** Resolves a code to its asset URL (kept injectable so the sheet owns the CDN path). */
  url: (code: string) => string;
}
