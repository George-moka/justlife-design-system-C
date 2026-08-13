# Architecture

Code is the single source of truth for the Justlife Design System. This document
is the in-repo reference; the original proposal lives in the project history.

## Core bet: write once, run everywhere

Components are authored in **React Native primitives** and rendered to web via
**react-native-web**. One implementation serves **iOS, Android, Mobile Web, and
Desktop Web**. Where platform conventions genuinely differ (date pickers, bottom
sheets, gestures, keyboard handling), add a platform file —
`Component.ios.tsx` / `Component.android.tsx` / `Component.web.tsx` — rather than
forcing a single implementation.

## Technology stack

| Concern | Choice |
| --- | --- |
| Language | TypeScript (strict) |
| Monorepo | pnpm workspaces + Turborepo |
| Runtime | React Native + react-native-web |
| Tokens | DTCG JSON → Style Dictionary v4 → CSS + TS |
| Catalog/docs | Storybook 8 (react-vite + react-native-web alias) |
| Company platform | claude.ai/design via `DesignSync` / `/design-sync` |
| Icons | react-native-svg |
| Quality | ESLint (+ `no-raw-values`), Vitest + RNW + jest-axe, Changesets |

## Packages

```
packages/tokens    DTCG source → CSS + TS outputs (3 tiers, light/dark)
packages/ui        ThemeProvider, primitives, components (RN + RNW)
packages/icons     icon set (Phase 2+)
packages/patterns  composite patterns & flows (Phase 3)
apps/storybook     catalog + documentation
tools/figma-sync   Figma REST API → component inventory / specs / assets
tools/generators   plop scaffolding (new component)
tools/eslint-plugin-justlife  token-only enforcement
```

## Token architecture (3 tiers)

1. **Primitive** — raw ramps/scales/font primitives. Never used by components.
2. **Semantic** — role aliases (`color.text.primary`, `space.md`,
   `typography.body`). Colour modes (light/dark) live here.
3. **Component** — per-component knobs (`button.bg.primary`) referencing
   semantic tokens.

Outputs: `dist/css/tokens.css` (web) and a typed `themes` object (RN + web).
The `ThemeProvider` exposes the active theme via `useTheme()`.

## Component architecture

Folder per component: implementation (`.tsx` + optional platform files),
`.stories.tsx`, `.docs.mdx`, `.test.tsx`, `index.ts`. Conventions: typed
`variant`/`size` props, full state matrix, a11y props, responsive via tokens +
`useBreakpoint()`, **token-only** values.

## Documentation architecture

Colocated MDX rendered in Storybook Docs, using the standard template
(see [`packages/ui/src/components/Button/Button.docs.mdx`](../packages/ui/src/components/Button/Button.docs.mdx)).
The catalog mirrors to claude.ai/design cards.

## Prototyping architecture

- **Storybook** — rich local/hosted catalog, controls, device viewports, docs.
- **claude.ai/design** — push preview cards via `DesignSync` for company-wide
  browse/share. Rich clickable prototyping lives in the (Phase 4) Expo Router
  prototype app + Storybook.

## Migration roadmap

> **Status (2026-06-29):** Phases 0–3 are largely delivered — real Figma tokens imported, **~86 components**
> built, and shared screens shipped (Funnel, Thank You, Profile, Bookings, Onboarding, Wallet). See
> [`HANDOFF.md`](HANDOFF.md) for the live current state. The phases below are the original structural plan.

- **Phase 0 (done)** — foundation: tokens, theming, 6 components, Storybook,
  governance, Figma-sync skeletons.
- **Phase 1** — audit: import real Figma variables (`pnpm tokens:import`); run
  `figma-sync` inventory; reconcile starter tokens.
- **Phase 2** — foundational component breadth + platform rules + claude.ai/design sync live.
- **Phase 3** — product components/patterns/flows (service/category cards,
  booking, checkout, loyalty, profile).
- **Phase 4** — prototyping platform GA (Expo prototype app, company publishing).
- **Phase 5** — governance maturity (visual regression, release cadence, metrics).

## Risks & tradeoffs

See the [proposal in plan history]; headline risks: react-native-web fidelity
gaps (mitigated by platform files + visual testing), Figma Variables REST API is
Enterprise-gated (variables come from JSON export), and claude.ai/design cards
are static-ish (rich prototyping lives in the Expo app/Storybook).
