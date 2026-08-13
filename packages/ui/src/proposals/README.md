# proposals/

A sandbox for **proposals from PMs and stakeholders** — ideas prototyped *against* the design system,
waiting for the design team to review. Nothing here is part of the official component library.

- Each proposal lives in its own subfolder with a `Proposals/<Idea>` Storybook story.
- Proposals **only compose existing DS components** (tokens only) — see [`AGENTS.md`](./AGENTS.md) in
  this folder for the rules an AI assistant must follow when building one here.
- Proposals arrive as **pull requests** (`Proposal: …`). The design team reviews each one and rebuilds
  the approved ones properly under `../components/`. Merging is gated by `CODEOWNERS`, so nothing lands
  in the system without a maintainer's review.
