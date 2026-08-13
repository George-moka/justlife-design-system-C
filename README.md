# Justlife Design System

A code-based design system, component library, and prototyping platform for the
Justlife product. **Code is the single source of truth** — Figma becomes a
reference/audit tool, not the place day-to-day product design happens.

Mobile app experiences (iOS, Android) are the default priority; Mobile Web and
Desktop Web are first-class targets. Components are authored once in **React
Native primitives** and rendered to web via **react-native-web**, so one
implementation serves all four platforms.

> **Resuming work / current state:** see **[docs/HANDOFF.md](docs/HANDOFF.md)** — the live
> single-source-of-truth for what's built, conventions, environment gotchas, the build flow,
> and the backlog.

## Packages

| Package | Description |
| --- | --- |
| [`@justlife/tokens`](packages/tokens) | Design tokens (DTCG source → CSS + TS + JS via Style Dictionary) |
| [`@justlife/ui`](packages/ui) | Cross-platform component library (RN + react-native-web) |
| [`@justlife/icons`](packages/icons) | SVG icon components _(stub — Phase 2+)_ |
| [`@justlife/patterns`](packages/patterns) | Composite patterns & flows _(stub — Phase 3)_ |
| [`apps/storybook`](apps/storybook) | Catalog + documentation surface |
| [`tools/*`](tools) | Figma sync, token import, generators, lint plugin |

## Getting started

```bash
corepack pnpm install        # or: pnpm install
pnpm build                   # build tokens + packages
pnpm storybook               # run the catalog at http://localhost:6006
```

## Common scripts

| Script | What it does |
| --- | --- |
| `pnpm build` | Build all packages (tokens, ui, …) |
| `pnpm storybook` | Run Storybook locally |
| `pnpm test` | Run unit + a11y tests |
| `pnpm lint` | Lint (incl. token-only enforcement) |
| `pnpm new:component` | Scaffold a new component (generator) |
| `pnpm tokens:import` | Import exported Figma variables JSON → tokens |
| `pnpm figma:inventory` | List Figma components via the REST API |

## Governance

Read [docs/governance.md](docs/governance.md) and
[docs/contributing.md](docs/contributing.md) before adding components or tokens.
The golden rules: **reuse before creation**, **tokens only**, and **every
component is documented**.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full proposal
(technology stack, token/component/documentation/prototyping architecture,
governance model, migration roadmap, and risks).
