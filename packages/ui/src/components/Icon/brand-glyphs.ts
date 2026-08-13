/**
 * **Brand glyphs** — the handful of icons the Justlife design owns that Lucide has no faithful match
 * for. Each is the raw path data extracted from Figma (via the Figma MCP asset export), so it recolours
 * and scales exactly like a Lucide glyph: `Icon` renders it filled with the resolved icon colour.
 *
 * Adding one is a **system-level decision** — extract from Figma only when the user asks for that exact
 * glyph (AGENTS #5: icons are Lucide; custom/brand icons only via extraction when directed).
 *
 * - `location-pin` — the solid address pin (Figma `Icons / location-dot-solid`, 20×20). Lucide's
 *   `map-pin` is an outline and has no filled variant — filling it also fills the inner dot, so the
 *   glyph loses its hole. This path carries the hole as an even-odd counter, like the design.
 * - `instant-bolt` — the "Instant / ETA" lightning (Figma `Icons / instant`, 20×20). Lucide's `zap` is a
 *   chunkier, flat-topped bolt; this is the slim, sharply-angled brand bolt used on the homepage ETA
 *   tags ("⚡ 30 Mins") and the address strip.
 */
export interface BrandGlyph {
  /** SVG viewBox — the glyph is drawn in this coordinate space and scaled to the icon size. */
  viewBox: string;
  /** A single filled path (no strokes), so one `fill` recolours the whole glyph. */
  path: string;
}

export const brandGlyphs: Record<string, BrandGlyph> = {
  'location-pin': {
    viewBox: '0 0 20 20',
    path: 'M10.7715 17.9167C12.4414 15.8268 16.25 10.7617 16.25 7.91667C16.25 4.46615 13.4505 1.66667 10 1.66667C6.54948 1.66667 3.75 4.46615 3.75 7.91667C3.75 10.7617 7.55859 15.8268 9.22852 17.9167C9.62891 18.4147 10.3711 18.4147 10.7715 17.9167ZM10 5.83334C10.5525 5.83334 11.0824 6.05283 11.4731 6.44353C11.8638 6.83423 12.0833 7.36414 12.0833 7.91667C12.0833 8.46921 11.8638 8.99911 11.4731 9.38981C11.0824 9.78051 10.5525 10 10 10C9.44747 10 8.91756 9.78051 8.52686 9.38981C8.13616 8.99911 7.91667 8.46921 7.91667 7.91667C7.91667 7.36414 8.13616 6.83423 8.52686 6.44353C8.91756 6.05283 9.44747 5.83334 10 5.83334Z',
  },
  'instant-bolt': {
    viewBox: '0 0 20 20',
    path: 'M8.47881 19.9525C8.72966 20.0656 9.02132 19.9712 9.16784 19.7271L15.8344 8.55523C15.9424 8.37441 15.9489 8.14609 15.8512 7.95956C15.7536 7.77245 15.5669 7.65628 15.3646 7.65628H10.9153L12.57 0.730146C12.6368 0.450341 12.5016 0.161357 12.2505 0.0474897C12.0009 -0.0657916 11.7074 0.0291694 11.5614 0.27292L4.89485 11.4448C4.78689 11.6256 4.78037 11.8539 4.87803 12.0405C4.9757 12.2276 5.16233 12.3437 5.36469 12.3437H9.81398L8.15925 19.2699C8.09251 19.5497 8.22759 19.8387 8.47881 19.9525Z',
  },
};

/** Whether a name resolves to a brand glyph (checked before falling through to Lucide). */
export const isBrandGlyph = (name: string): boolean => name in brandGlyphs;
