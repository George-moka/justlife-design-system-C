import { query } from "@anthropic-ai/claude-agent-sdk";
import { config } from "./config.js";

/**
 * The sandbox guardrail — mirrors packages/ui/src/proposals/AGENTS.md so the
 * agent stays in its lane even before it reads the repo.
 */
const GUARDRAIL = `You are helping a NON-TECHNICAL product manager prototype a NEW component proposal in the Justlife design system monorepo. The PM describes an idea in plain language; you build a working prototype.

HARD RULES — never cross:
- Write ONLY inside packages/ui/src/proposals/. Never create, edit, move, or delete anything under packages/ui/src/components/, packages/ui/src/screens/, packages/tokens/, or anywhere else. Never add or change a design token.
- First read the repo root AGENTS.md and packages/ui/src/proposals/AGENTS.md and obey them: every visual value comes from useTheme() tokens (no raw hex/px), Button size="xs", equal-size rows, currency uses the Dirham component, etc.
- Reuse existing DS components (Button, Card, ListRow, Badge, PageShell, Text, Input, TimeSlotPicker, WeekdayPicker, StepIndicator, …). Compose from what already exists — never fork or reimplement a component.

DELIVERABLE:
- Create the proposal as a Storybook story so it shows under "Proposals/":
    packages/ui/src/proposals/<PascalCaseIdea>/<PascalCaseIdea>.stories.tsx
  with a default meta { title: 'Proposals/<Readable Idea>' } and at least one story that renders the component. Put any new component code in that same folder.
- Make it typecheck: run \`corepack pnpm@9.15.0 --filter @justlife/ui typecheck\` and fix errors before finishing.
- Do NOT run Storybook or Chromatic — just leave the files on disk; publishing is handled for you.
- Build ONLY the single component the PM asked for. Keep it focused and on-brand.`;

/** The screen a PM chose to start from — steers the agent to build on it. */
export interface ScreenContext {
  screenName: string; // "Home Cleaning Funnel"
  importPath: string; // "packages/ui/src/screens/HomeCleaningFunnel.stories.tsx"
  proposalTitle: string; // "Proposals/Home Cleaning Funnel"
  proposalFolder: string; // "HomeCleaningFunnel"
  iterate?: boolean; // true = a follow-up tweak on the proposal already built this session
}

/** Wrap the PM's plain-language change in the screen it should be applied to. */
function frame(userPrompt: string, ctx?: ScreenContext): string {
  if (!ctx) return userPrompt;
  const file = `packages/ui/src/proposals/${ctx.proposalFolder}/${ctx.proposalFolder}.stories.tsx`;

  // Follow-up tweak: the proposal already exists on disk — refine it, don't restart.
  if (ctx.iterate) {
    return `This is a FOLLOW-UP tweak to a prototype you already built for the PM, which lives in \`packages/ui/src/proposals/${ctx.proposalFolder}/\` (story \`${file}\`, title '${ctx.proposalTitle}', based on the ${ctx.screenName} screen).

FIRST read every file in \`packages/ui/src/proposals/${ctx.proposalFolder}/\` to see the current state. Then apply this follow-up change ON TOP of it — keep everything else exactly as it is, change only what's asked:
"""
${userPrompt}
"""

Stay inside \`packages/ui/src/proposals/${ctx.proposalFolder}/\`. Keep the same story title '${ctx.proposalTitle}' and \`Default\` export. Never edit the original screen or any DS component; reuse DS components and tokens. Make it typecheck (\`corepack pnpm@9.15.0 --filter @justlife/ui typecheck\`) before finishing.`;
  }

  return `The product manager is working from the existing **${ctx.screenName}** screen.
Its Storybook story is \`${ctx.importPath}\`; read it first — it imports a shared screen component (re-exported from \`packages/ui/src/index\`) and wraps it in the web \`Phone\` frame.

Build the PM's change as a NEW proposal that starts from that screen, WITHOUT touching the original:
1. Read the screen's story + the shared screen component it renders to understand the current composition and which DS components it uses.
2. Work only inside \`packages/ui/src/proposals/${ctx.proposalFolder}/\`. If the change is purely additive (a new card/section/banner) you may import the real screen component and compose around it; if it needs edits to the screen's internals, copy the composition into the proposal folder and edit the copy. Never edit the original screen or any DS component; reuse DS components and tokens.
3. Create the story at \`${file}\` with EXACTLY this shape so the preview link resolves:
     const meta = { title: '${ctx.proposalTitle}', parameters: { layout: 'fullscreen' } };
     export default meta;
     export const Default = { render: () => (/* the changed screen inside <Phone> */) };
   Import the frame with \`import { Phone } from '../../_dev/PhoneFrame'\` and DS pieces from \`'../../index'\`. Keep the title and \`Default\` export names exact.

The change the PM asked for (verbatim):
"""
${userPrompt}
"""`;
}

/** Hard ceiling on a single agent run so the bot never hangs forever. */
const AGENT_TIMEOUT_MS = Number(process.env.AGENT_TIMEOUT_MS) || 10 * 60 * 1000;

/** Run the coding agent against the cloned repo. Streams assistant notes via onNote. */
export async function runAgent(
  cwd: string,
  userPrompt: string,
  onNote: (text: string) => void,
  context?: ScreenContext,
  model?: string,
): Promise<void> {
  const abort = new AbortController();
  let stderrBuf = ""; // keep the CLI's stderr so we can surface the real cause
  const q = query({
    prompt: frame(userPrompt, context),
    options: {
      cwd,
      model: model ?? config.agentModel,
      systemPrompt: { type: "preset", preset: "claude_code", append: GUARDRAIL },
      permissionMode: "bypassPermissions", // non-interactive: no approval prompts
      allowedTools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
      maxTurns: 80,
      persistSession: false,
      abortController: abort,
      stderr: (d: string) => {
        stderrBuf += d;
        process.stderr.write(`[agent-stderr] ${d}`);
      },
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: config.anthropicApiKey,
        // Non-interactive: nested pnpm/corepack/tsc must never block on a prompt.
        CI: "1",
        COREPACK_ENABLE_DOWNLOAD_PROMPT: "0",
        PATH: `${process.env.HOME}/.local/bin:${process.env.PATH ?? ""}`,
      },
    },
  });

  // SDK message types aren't imported precisely here — read defensively.
  // In SDK 0.3.x the assistant payload is nested under `.message`.
  let errText: string | null = null;
  const consume = async (): Promise<void> => {
    for await (const message of q as AsyncIterable<any>) {
      console.log(`[agent] ${message?.type}${message?.subtype ? "/" + message.subtype : ""}`);
      if (message?.type === "assistant") {
        const content = message.message?.content ?? message.content ?? [];
        for (const block of content) {
          if (block?.type === "text" && typeof block.text === "string" && block.text.trim()) {
            onNote(block.text.trim());
          }
        }
      } else if (message?.type === "result" && (message.is_error || (message.subtype && message.subtype !== "success"))) {
        // Capture the real reason (e.g. an API error string) so the caller can
        // surface it instead of the opaque "process exited with code 1".
        errText =
          typeof message.result === "string" && message.result.trim()
            ? message.result.trim()
            : `Agent ended with: ${message.subtype ?? "error"}`;
      }
    }
    if (errText) throw new Error(errText);
  };

  // Race the message stream against a hard timeout — if the SDK iterator ever
  // wedges (e.g. the CLI exits without closing the stream, as happened once),
  // abort and recover instead of hanging the user's request forever.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const consumed = consume();
  consumed.catch(() => {}); // swallow a late rejection after a timeout abort
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      abort.abort();
      try {
        (q as unknown as { interrupt?: () => Promise<unknown> }).interrupt?.();
      } catch {
        /* ignore */
      }
      reject(
        new Error(
          `The agent took too long (over ${Math.round(AGENT_TIMEOUT_MS / 60000)} min) and was stopped. Try a smaller change, or say "new" to start fresh.`,
        ),
      );
    }, AGENT_TIMEOUT_MS);
  });

  try {
    await Promise.race([consumed, timeout]);
  } catch (e) {
    const base = errText ?? (e instanceof Error ? e.message : String(e));
    // No structured result (the CLI died) → append its stderr so the real cause shows.
    const detail = !errText && stderrBuf.trim() ? `\n\n${stderrBuf.trim().slice(-1000)}` : "";
    throw new Error(base + detail);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
