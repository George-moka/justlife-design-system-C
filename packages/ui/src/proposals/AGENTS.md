# Proposals — stakeholder sandbox (READ THIS FIRST)

**This folder is a sandbox for PROPOSALS from PMs / stakeholders. It is NOT part of the shipped
design system.** Everything here is disposable: the design team reviews proposals and rebuilds the
approved ones properly under `components/`.

If you are an AI assistant helping someone prototype an idea in here, these rules are **hard limits**:

## Hard boundaries — do not cross

- **Write ONLY inside `packages/ui/src/proposals/`.** Never create, edit, move, or delete files under
  `packages/ui/src/components/`, `packages/ui/src/screens/`, `packages/tokens/`, or anywhere else in
  the repo. If a proposal seems to need a change outside this folder, **stop and say so** — don't do it.
- **Never add or change a design token.** Use existing tokens through `useTheme()` only. No raw
  colours, sizes, or fonts.
- **Reuse existing DS components** (`Button`, `Card`, `ListRow`, `Badge`, `PageShell`, `Text`, `Input`,
  …). Compose the proposal from what already exists — never fork or reimplement a component.
- **A proposal is a suggestion, not a merge.** When it's ready, open a **pull request** for the
  design-system maintainers to review. Do not merge to `main`.

## How to build a proposal

1. **Read the repo root `AGENTS.md` first.** Every design rule there still applies (tokens only,
   `Button size="xs"`, equal-size rows, dirham symbol for currency, etc.).
2. Create `packages/ui/src/proposals/<YourIdea>/<YourIdea>.stories.tsx` with
   `title: 'Proposals/<YourIdea>'` so it shows under **Proposals/** in Storybook.
3. Build the UI by composing existing DS components. Tokens only — no raw values.
4. Verify it renders, share a screenshot, then open a PR titled `Proposal: <YourIdea>`.

That's it. Stay in this folder, reuse the system, hand it to the design team.
