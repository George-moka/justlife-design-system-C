# @justlife/builder — DS Builder (real components)

A prompt-to-screen builder for the Justlife Design System. You type what you want,
Claude returns a screen spec, and it renders **with the real `@justlife/ui` components**
(React Native → react-native-web). Because it draws the actual library components,
output is DS-accurate by construction — no hand-reimplemented copies to drift.

It mirrors `apps/prototype`'s proven Expo toolchain (same `metro.config.js`,
`babel.config.js`, deps), so it runs the same way inside this monorepo.

## Run locally

```bash
# from the repo root
pnpm install
pnpm build                     # builds tokens + ui (first time)
pnpm --filter @justlife/builder web
```

The generate button calls `/api/generate`, which needs the Claude proxy. For local
testing run it behind Netlify dev (serves the web app **and** the function):

```bash
cd apps/builder
ANTHROPIC_API_KEY=sk-ant-... npx netlify dev
```

## Deploy (Netlify — same flow as the existing builder)

- Build command: `npx expo export --platform web --output-dir dist`
- Publish directory: `apps/builder/dist`
- Functions directory: `apps/builder/netlify/functions`
- Env var: `ANTHROPIC_API_KEY` (required). Optional: `ANTHROPIC_MODEL`
  (defaults to `claude-3-5-sonnet-latest`; set it to the model your account uses).

`netlify.toml` already wires `/api/*` → the function and SPA fallback.

## How it's wired

| File | Role |
| --- | --- |
| `App.tsx` | Builder UI (prompt, generate, edit, phone preview). Chrome is plain RN; the preview is real DS. |
| `src/registry.tsx` | Maps generated `{component, props}` → real `@justlife/ui` components. |
| `src/catalog.ts` | The system prompt describing the components + props sent to Claude. |
| `src/generate.ts` | Calls the streaming proxy and parses the screen spec. |
| `netlify/functions/generate.mjs` | Streaming Claude proxy (key stays server-side). |

## Adding a component

1. Import it and add an entry in `src/registry.tsx`.
2. Add a matching `- "Name" {props}` line in `src/catalog.ts`.

That's it — the ruleset and the renderer are the only two places that list components.
The registry currently covers a curated core set (~20 components) for booking/checkout/
home flows; extend it incrementally as needed.
