# Contributing

## Prerequisites

- Node ≥ 20, pnpm 9 (`corepack pnpm` works without a global install).

## Setup

```bash
pnpm install
pnpm build        # build tokens (required before storybook/tests)
pnpm storybook    # http://localhost:6006
```

## Day-to-day

| Task | Command |
| --- | --- |
| Run the catalog | `pnpm storybook` |
| Add a component | `pnpm new:component` |
| Build tokens | `pnpm tokens:build` |
| Import Figma tokens | `pnpm tokens:import` |
| List Figma components | `pnpm figma:inventory` |
| Typecheck | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Test | `pnpm test` |
| Format | `pnpm format` |

## Adding a component (checklist)

1. `pnpm new:component` → scaffolds `Component.tsx`, `index.ts`,
   `Component.stories.tsx`, `Component.docs.mdx`, `Component.test.tsx`.
2. Implement with **tokens only** (`useTheme()`), full variant/state matrix.
3. Cover all variants and states in stories.
4. Fill in the MDX docs template.
5. Add unit + a11y tests.
6. Handle platform differences with `.web/.ios/.android` files where needed.
7. `pnpm lint && pnpm test`, add a changeset, open a PR.

## Definition of done

- Lint passes (including `no-raw-values`).
- Tests (unit + a11y) pass.
- Stories render across light/dark and mobile viewports.
- Docs follow the template.
- A changeset is included for published-package changes.
