# @justlife/tokens

Design tokens for the Justlife Design System. **DTCG JSON is the source**;
[Style Dictionary](https://styledictionary.com) builds platform outputs.

> ✅ **Imported from Figma.** The `src/primitive/*` and `src/themes/*` tokens are
> generated from the real Figma variables export (`Variables/`) via
> `pnpm tokens:import`. Re-run that command whenever the export changes. The
> `src/semantic/*` files (spacing/radius/typography/elevation roles) are
> hand-authored additions — see their `$description` fields for why.

## Token tiers

1. **Primitive** (`src/primitive/`) — raw palette ramps, scales, font primitives,
   durations. No meaning. Never referenced directly by components.
2. **Semantic** (`src/semantic/` + `src/themes/`) — role-based aliases
   (`color.text.primary`, `space.md`, `radius.control`, `typography.body`).
   Colour lives in `themes/light.json` + `themes/dark.json`.
3. **Component** (`src/component/`) — per-component knobs (`button.bg.primary`)
   that reference semantic tokens.

## Outputs (after `pnpm --filter @justlife/tokens build`)

| File | Consumer |
| --- | --- |
| `dist/css/tokens.css` | Web (CSS custom properties; light + dark) |
| `dist/index.js` / `.d.ts` | React Native + web (`themes`, `Tokens`, `ThemeName`) |

```ts
import { themes, type Tokens } from '@justlife/tokens';
themes.light.color.text.primary; // -> "#16191B"
themes.dark.color.bg.canvas; //     -> "#16191B"
```

```css
@import '@justlife/tokens/css';
.foo { color: var(--color-text-primary); }
```

## Importing from Figma

- **Variables (JSON):** export from Figma → save to `figma-export.json` →
  `pnpm tokens:import`. (Figma's *Variables REST API* is Enterprise-gated, so the
  JSON export is the reliable path for variables.)
- **Components/specs/assets:** see [`tools/figma-sync`](../../tools/figma-sync).
