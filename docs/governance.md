# Governance

The design system serves hundreds of screens and many teams. Consistency and
maintainability beat individual preference and short-term convenience.

> **Building something? Start with [`../AGENTS.md`](../AGENTS.md)** — the tool-agnostic operating rules
> (the three golden rules below, plus the accumulated **design conventions** and how each is enforced).
> Any AI assistant or contributor should read it before creating or changing anything.

## The three golden rules

1. **Reuse before creation.** Audit existing components → patterns → tokens →
   variants before adding anything new.
2. **Tokens only.** No raw colours or dimensions in components. Enforced by the
   `no-raw-values` ESLint rule.
3. **Everything is documented.** Each component ships stories, MDX docs, and
   tests.

## Creating a new component

1. Audit existing components and compositions.
2. Confirm no combination of existing primitives solves it.
3. Build the **smallest** new component that fits the system.
4. Use tokens only; add tokens only if unavoidable (see below).
5. Document immediately (the generator scaffolds the template).
6. Open a PR; the reuse-first checklist is required.

Scaffold with:

```bash
pnpm new:component
```

## Creating a new token

A new token is a **system-level decision**. Before adding one:

1. Verify it does not already exist (primitive/semantic/component tiers).
2. Verify no existing token can solve the problem.
3. Write down *why* it is necessary (in the PR).
4. Place it in the correct tier and document it.
5. Get design-system CODEOWNERS approval.

Avoid token proliferation. Prefer composing existing semantic tokens.

## Design conventions

Beyond the golden rules, the system carries reusable **design conventions** (defaults, spacing/radius
discipline, safe-area insets, selection treatments, cross-state shape consistency, etc.). The canonical,
maintained list — each tagged with how it's enforced — lives in [`../AGENTS.md`](../AGENTS.md). The
durable ones are already structural: token **defaults** (radius 12 / spacing 8 / hairline 0.5), the
`safeArea` insets, and the `no-raw-values` lint rule. Conventions graduate to code enforcement
(token → lint → test → CI) over time; when you implement one structurally, update its row in AGENTS.md.

## Ownership & review

- `CODEOWNERS` routes token, governance, and architecture changes to the
  design-system maintainers.
- CI gates every PR: build · lint (incl. token-only) · test.

## Versioning & releases

- Changes to published packages require a **changeset** (`pnpm changeset`).
- Semver + changelog are managed by Changesets.

## Decisions

Significant decisions are recorded as ADRs in [`docs/adr`](adr).
