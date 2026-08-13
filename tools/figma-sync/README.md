# @justlife/figma-sync

Pulls structural data from Figma via the REST API to drive the Phase-1 audit and
faithful recreation of components in code.

```bash
export FIGMA_TOKEN=<personal access token>     # never commit this
export FIGMA_FILE_KEY=<file key from the URL>
pnpm figma:inventory
```

Outputs `output/components.json` — every `COMPONENT` / `COMPONENT_SET` with its
name, id, type, and page.

## Scope & caveats

- **Variables** are **not** fetched here — the Figma Variables REST API is
  Enterprise-gated. Export variables as JSON and run `pnpm tokens:import`.
- Roadmap (Phase 2): node specs (`/v1/files/:key/nodes`) and image export
  (`/v1/images/:key`) for assets/icons.
- `FIGMA_TOKEN` is read from the environment only. Do not hard-code it.
