import { App } from "@slack/bolt";
import type { BlockAction, ButtonAction } from "@slack/bolt";
import { config } from "./config.js";
import { runAgent } from "./agent.js";
import { triage } from "./chat.js";
import { openProposalPR } from "./github.js";
import http from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  ensureWorkspace,
  startFreshBranch,
  commitLocal,
  pushBranch,
  buildAndPublish,
  inspectWorkspace,
  addToGallery,
  containerMemMB,
} from "./workspace.js";
import {
  listScreens,
  screenPreviewUrl,
  proposalTitle,
  proposalFolder,
  proposalStoryId,
  proposalLinks,
  type Screen,
  type ProposalLinks,
} from "./screens.js";

interface Session {
  screen?: Screen; // the screen the PM chose to start from
  branch?: string; // cut lazily on the first change
  lastPrompt?: string;
  hasProposal?: boolean; // a build exists → "kaydet" is allowed
  model?: string; // chosen model id; defaults to Opus
  lastLink?: string; // legacy single link (pre-both-links) — kept for back-compat
  lastLinks?: ProposalLinks; // most recent preview links (for the "link" command)
  pending?: { channel: string; text: string }; // an important message Slack was down for
  userName?: string; // the PM's display name (resolved once, for PR attribution)
  onboarded?: boolean; // has this PM seen the welcome intro?
}

// Shown once, the first time a PM ever messages the bot.
const INTRO =
  "👋 *Hi! I turn your ideas into live app prototypes* — no design tools, no code.\n\n" +
  "*How it works:*\n" +
  "1️⃣  Pick a screen\n" +
  "2️⃣  Tell me what to change, in plain English\n" +
  "3️⃣  I send you a live, clickable link in ~2 minutes\n\n" +
  "Then keep chatting to refine it. Anytime: *save* → send to the design team · *link* → resend your link · *new* → start over.\n\nLet's go 👇";

/** Best-effort real name for a Slack user (needs the users:read scope; falls back to ""). */
async function resolvePmName(
  client: { users: { info: (a: { user: string }) => Promise<unknown> } },
  userId: string,
): Promise<string> {
  const cached = sessions.get(userId)?.userName;
  if (cached) return cached;
  try {
    const r = (await client.users.info({ user: userId })) as {
      user?: { real_name?: string; profile?: { real_name?: string; display_name?: string } };
    };
    const name = r.user?.profile?.real_name || r.user?.real_name || r.user?.profile?.display_name || "";
    if (name) {
      const s = sessions.get(userId) ?? {};
      s.userName = name;
      sessions.set(userId, s);
      persistSessions();
    }
    return name;
  } catch {
    return ""; // no users:read scope, or transient — caller falls back to a mention
  }
}

/** The two labeled links we hand back — fullscreen prototype + Storybook UI. */
function formatLinks(links: ProposalLinks): string {
  return (
    `📱 *Prototype (fullscreen):*\n${links.fullscreen}\n\n` +
    `🧩 *In Storybook (with sidebar):*\n${links.storybook}`
  );
}

/** "claude-opus-5" → "Opus 5", "claude-opus-4-8" → "Opus 4.8". Falls back to the raw id. */
function prettyModel(id: string): string {
  const m = /^claude-(opus|sonnet|haiku)-(\d+)(?:-(\d+))?/.exec(id);
  if (!m) return id;
  const family = m[1] ?? "";
  const major = m[2] ?? "";
  const minor = m[3];
  return `${family.charAt(0).toUpperCase()}${family.slice(1)} ${major}${minor ? `.${minor}` : ""}`;
}

// Model choice offered on the picker — the strong one for tricky work, Sonnet for simple/fast. The
// strong option IS whatever `AGENT_MODEL` resolves to, and its label is derived from that id: the
// button used to be typed by hand, so a deployment whose env still pinned an older model advertised the
// new one. A label that can't disagree with the id is a label that can't lie.
const MODELS = {
  opus: { id: config.agentModel, label: prettyModel(config.agentModel), blurb: "top quality" },
  sonnet: { id: "claude-sonnet-5", label: "Sonnet", blurb: "faster & cheaper" },
} as const;
const modelKey = (id?: string): "opus" | "sonnet" => (id === MODELS.sonnet.id ? "sonnet" : "opus");

const sessions = new Map<string, Session>();
const busy = new Set<string>();

// Sessions persist to disk so a bot restart doesn't drop everyone's context
// (which screen they're on, their branch, whether a proposal exists to save).
const SESSIONS_FILE = path.join(process.cwd(), "sessions.json");
function persistSessions(): void {
  try {
    writeFileSync(SESSIONS_FILE, JSON.stringify(Object.fromEntries(sessions)));
  } catch (e) {
    console.error("persistSessions failed:", e instanceof Error ? e.message : e);
  }
}
function hydrateSessions(): void {
  try {
    const obj = JSON.parse(readFileSync(SESSIONS_FILE, "utf8")) as Record<string, Session>;
    for (const [k, v] of Object.entries(obj)) sessions.set(k, v);
    if (sessions.size) console.log(`Restored ${sessions.size} session(s) from disk.`);
  } catch {
    /* no file yet — first run */
  }
}

const app = new App({
  token: config.slackBotToken,
  appToken: config.slackAppToken,
  signingSecret: config.slackSigningSecret,
  socketMode: true, // no public URL needed
});

/** The multiple-choice screen picker (buttons — one tap on mobile) + a model toggle. */
function pickerBlocks(screens: Screen[], currentModelId?: string) {
  const mk = modelKey(currentModelId);
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Step 1 — pick the screen you want to change:*\nTap one below and I'll show you how it looks today.",
      },
    },
    {
      type: "actions",
      elements: screens.slice(0, 25).map((s, i) => ({
        type: "button",
        text: { type: "plain_text", text: s.name, emoji: false },
        action_id: `pick_screen:${i}`,
        value: JSON.stringify({ name: s.name, storyId: s.storyId, importPath: s.importPath }),
      })),
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `⚡ *Optional — pick the AI model* (currently *${MODELS[mk].label}*): tap *Sonnet* for simple changes (faster & cheaper) or *Opus* for tricky ones. Not sure? Leave it.`,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: `${MODELS.opus.label}${mk === "opus" ? " ✓" : ""}`, emoji: false },
          action_id: "set_model:opus",
          value: "opus",
          ...(mk === "opus" ? { style: "primary" } : {}),
        },
        {
          type: "button",
          text: { type: "plain_text", text: `${MODELS.sonnet.label}${mk === "sonnet" ? " ✓" : ""}`, emoji: false },
          action_id: "set_model:sonnet",
          value: "sonnet",
          ...(mk === "sonnet" ? { style: "primary" } : {}),
        },
      ],
    },
  ];
}

type Say = (msg: string | { text: string; blocks?: unknown[] }) => Promise<unknown>;

async function showPicker(say: Say, currentModelId?: string): Promise<void> {
  const screens = await listScreens();
  if (!screens.length) {
    await say("⚠️ I couldn't load the screen list right now — mind trying again in a minute?");
    return;
  }
  await say({ text: "Which screen should we work on?", blocks: pickerBlocks(screens, currentModelId) });
}

// PM clicked a screen in the picker → show its current state, arm the session.
app.action(/^pick_screen:/, async ({ ack, body, client }) => {
  await ack();
  const b = body as BlockAction;
  const userId = b.user.id;
  const action = b.actions[0] as ButtonAction;
  let picked: Screen;
  try {
    picked = JSON.parse(action.value ?? "{}") as Screen;
  } catch {
    return;
  }
  if (!picked?.name) return;

  const session = sessions.get(userId) ?? {};
  session.screen = picked;
  session.branch = undefined;
  session.hasProposal = false;
  session.lastPrompt = undefined;
  sessions.set(userId, session);
  persistSessions();

  const channel = b.channel?.id ?? userId;
  await client.chat.postMessage({
    channel,
    text:
      `📱 Here's *${picked.name}* as it looks today:\n${screenPreviewUrl(picked.storyId)}\n\n` +
      `*Step 2 — now tell me what to change*, in plain English. For example:\n` +
      `• *"add an 'Earliest Available Slot' card near the top"*\n` +
      `• *"make the header bigger and use an amber background"*\n\n` +
      `I'll build it and send you a live link. (Not sure what's possible? Just ask me — e.g. *"what could I add here?"*)`,
  });
});

// PM tapped a model button → set it for this session.
app.action(/^set_model:/, async ({ ack, body, client }) => {
  await ack();
  const b = body as BlockAction;
  const userId = b.user.id;
  const action = b.actions[0] as ButtonAction;
  const key = action.value === "sonnet" ? "sonnet" : "opus";
  const session = sessions.get(userId) ?? {};
  session.model = MODELS[key].id;
  sessions.set(userId, session);
  persistSessions();
  const channel = b.channel?.id ?? userId;
  await client.chat.postMessage({
    channel,
    text: `⚡ Model set to *${MODELS[key].label}* — ${MODELS[key].blurb}.${key === "sonnet" ? " Great for simpler changes." : ""}`,
  });
});

/**
 * A live-feeling progress line we edit in place: a filling ▓ bar + stage + timer.
 * Real % is unknowable, so the bar animates by time within each stage (build
 * 5→60%, publish 62→92%) and only hits 100% when the real link is ready.
 */
function renderProgress(
  screenName: string,
  phase: "build" | "publish",
  phaseStart: number,
  overallStart: number,
): string {
  const inPhase = (Date.now() - phaseStart) / 1000;
  const pct =
    phase === "build"
      ? Math.round(5 + Math.min(55, (inPhase / 240) * 55))
      : Math.round(62 + Math.min(30, (inPhase / 180) * 30));
  const filled = Math.max(0, Math.min(10, Math.round(pct / 10)));
  const bar = "▓".repeat(filled) + "░".repeat(10 - filled);
  const label = phase === "build" ? "🛠️ building your change" : "📦 publishing the live preview";
  const total = Math.floor((Date.now() - overallStart) / 1000);
  const clock = `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  return `*${screenName}*\n${label}\n\`${bar}\` ${pct}%   ·   ${clock}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Deliver a user's queued (undelivered) message and clear it on success. Uses
 * `app.client` so the background flusher can call it outside any event context.
 */
async function deliverPending(userId: string): Promise<boolean> {
  const s = sessions.get(userId);
  if (!s?.pending) return true;
  try {
    await app.client.chat.postMessage({ channel: s.pending.channel, text: s.pending.text });
    s.pending = undefined;
    persistSessions();
    return true;
  } catch {
    return false; // leave it queued — the flusher will keep retrying
  }
}

/**
 * Queue an important result (the link, an error) and try hard to deliver it:
 * snappy retries now, and the background flusher keeps trying afterward. Because
 * it's persisted, even a bot restart or a long Slack outage can't strand the PM —
 * the message lands as soon as connectivity returns, no PM/operator action needed.
 */
async function queueResult(userId: string, channel: string, text: string): Promise<void> {
  const s = sessions.get(userId) ?? {};
  s.pending = { channel, text };
  sessions.set(userId, s);
  persistSessions();
  for (let i = 0; i < 5; i++) {
    if (await deliverPending(userId)) return;
    await sleep(3000 + i * 2000);
  }
}

// ─── Shared-gallery queue ────────────────────────────────────────────────────
// Saving does two things: open the PR (fast) and mirror the proposal into the
// shared gallery (a full Storybook build + publish, ~3 min). The mirror used to
// run fire-and-forget, so a container restart or a transient build/OOM failure
// dropped it silently — the PR survived but the gallery never updated. This
// queue makes the mirror durable: jobs persist to disk, a single-flight
// processor retries them (serialized, so concurrent builds can't stack + OOM),
// and if one keeps failing the PM is told (softly) and the design team alerted
// instead of losing it quietly. The pushed branch stays the source of truth.
interface GalleryJob {
  branch: string;
  userId: string;
  pmLabel: string;
  screenName: string;
  srcFolder: string;
  dmChannel: string; // where to DM the PM the gallery link
  attempts: number;
}
const GALLERY_MAX_ATTEMPTS = 5;
const galleryQueue = new Map<string, GalleryJob>(); // key `${userId}::${screenName}` — a re-save replaces the pending job
const GALLERY_QUEUE_FILE = path.join(process.cwd(), "gallery-queue.json");
let galleryRunning = false;

function persistGalleryQueue(): void {
  try {
    writeFileSync(GALLERY_QUEUE_FILE, JSON.stringify(Object.fromEntries(galleryQueue)));
  } catch (e) {
    console.error("persistGalleryQueue failed:", e instanceof Error ? e.message : e);
  }
}
function hydrateGalleryQueue(): void {
  try {
    const obj = JSON.parse(readFileSync(GALLERY_QUEUE_FILE, "utf8")) as Record<string, GalleryJob>;
    for (const [k, v] of Object.entries(obj)) galleryQueue.set(k, v);
    if (galleryQueue.size) console.log(`Restored ${galleryQueue.size} pending gallery job(s) from disk.`);
  } catch {
    /* no file yet — first run */
  }
}

/** Durably enqueue a proposal for the shared gallery and kick the processor. */
function enqueueGalleryJob(job: GalleryJob): void {
  galleryQueue.set(`${job.userId}::${job.screenName}`, job);
  persistGalleryQueue();
  void processGalleryQueue();
}

/**
 * Drain the gallery queue one job at a time (single-flight; serialized builds
 * can't OOM). On success: DM the PM the permalink. On repeated failure: drop the
 * job after GALLERY_MAX_ATTEMPTS, reassure the PM their proposal is still safe in
 * the PR, and alert the report channel to backfill. Safe to call anytime — each
 * save, the interval, and startup all call it.
 */
async function processGalleryQueue(): Promise<void> {
  if (galleryRunning || galleryQueue.size === 0) return;
  galleryRunning = true;
  try {
    for (const [key, job] of [...galleryQueue]) {
      try {
        const url = await addToGallery({
          branch: job.branch,
          userId: job.userId,
          pmLabel: job.pmLabel,
          screenName: job.screenName,
          srcFolder: job.srcFolder,
        });
        galleryQueue.delete(key);
        persistGalleryQueue();
        await queueResult(
          job.userId,
          job.dmChannel,
          `🖼 Your *${job.screenName}* proposal is now in the shared gallery with everyone else's:\n${url}`,
        );
      } catch (e) {
        job.attempts += 1;
        persistGalleryQueue();
        const err = e instanceof Error ? e.message : String(e);
        console.error(`gallery job failed (attempt ${job.attempts}) — ${job.userId}/${job.screenName}:`, err);
        if (job.attempts >= GALLERY_MAX_ATTEMPTS) {
          galleryQueue.delete(key);
          persistGalleryQueue();
          await queueResult(
            job.userId,
            job.dmChannel,
            `⚠️ Your *${job.screenName}* proposal is safely saved — it's in the PR the design team reviews. ` +
              `Only the shared *gallery* mirror failed to update (after ${job.attempts} tries); the team's been notified to add it.`,
          );
          if (config.reportChannel) {
            await app.client.chat
              .postMessage({
                channel: config.reportChannel,
                text:
                  `🖼⚠️ *Gallery mirror failed* for <@${job.userId}> — *${job.screenName}* after ${job.attempts} attempts.\n` +
                  `The proposal is intact on branch \`${job.branch}\` (and its PR) — it just needs re-adding to the gallery from there.\n` +
                  `\`\`\`${err.slice(0, 800)}\`\`\``,
              })
              .catch(() => {});
          }
        }
        break; // a failure is usually systemic (build/OOM) — stop this pass; the interval retries
      }
    }
  } finally {
    galleryRunning = false;
  }
}

// Only respond to real user messages in a direct message (the bot's private DM).
app.message(async ({ message, say, client }) => {
  const m = message as {
    channel_type?: string;
    subtype?: string;
    bot_id?: string;
    user?: string;
    text?: string;
    channel?: string;
  };
  if (m.channel_type !== "im" || m.subtype || m.bot_id || !m.user) return;

  const userId = m.user;
  const dmChannel = m.channel ?? userId; // reliable DM channel for resilient sends
  const text = (m.text ?? "").trim();
  if (!text) return;

  // Redeliver anything that failed to send earlier (e.g. Slack was briefly down).
  void deliverPending(userId);

  if (busy.has(userId)) {
    await say("⏳ Still working on your last request — I'll send the link the moment it's ready.");
    return;
  }

  const lower = text.toLowerCase();
  const isReset = /^(new|reset|yeni|sıfırla|baştan)\b/.test(lower);
  const isSave = /^(save|kaydet|beğendim|begendim|onayla|gönder|gonder)\b/.test(lower);
  const isStatus = /^(link|status|durum|nerede|son link)\b/.test(lower);

  // Link/status → resend the latest preview link (a lever for the PM if a send was missed).
  if (isStatus) {
    const s = sessions.get(userId);
    if (s?.pending) {
      await deliverPending(userId);
      return;
    }
    if (s?.lastLinks) {
      await say(`Here's your latest prototype:\n\n${formatLinks(s.lastLinks)}`);
      return;
    }
    if (s?.lastLink) {
      await say(`Here's your latest prototype:\n${s.lastLink}`);
      return;
    }
    await say("No prototype yet — say *hi*, pick a screen, and describe a change.");
    return;
  }

  // Reset → back to the screen picker.
  if (isReset) {
    const prev = sessions.get(userId); // keep model + onboarded across reset
    sessions.set(userId, { model: prev?.model, onboarded: prev?.onboarded });
    persistSessions();
    await say("🆕 Starting fresh!");
    await showPicker(say as Say, prev?.model);
    return;
  }

  // Save → push the branch + open a Proposal PR.
  if (isSave) {
    const s = sessions.get(userId);
    let branch = s?.branch && s.hasProposal ? s.branch : undefined;
    let screenName = s?.screen?.name;
    let lastPrompt = s?.lastPrompt;
    if (!branch) {
      // In-memory session gone (e.g. the bot restarted) — recover from the clone.
      const rec = await inspectWorkspace(userId);
      if (rec) {
        branch = rec.branch;
        screenName = screenName ?? rec.screenName;
        lastPrompt = lastPrompt ?? rec.lastPrompt;
      }
    }
    if (!branch) {
      await say("There's nothing to save yet 🙂 Say *hi*, pick a screen, and describe a change first — then *save* sends it to the design team.");
      return;
    }
    busy.add(userId);
    try {
      await say("💾 Saving your proposal and opening a PR for the design team…");
      const dir = await ensureWorkspace(userId);
      await pushBranch(dir, branch);
      const pmName = await resolvePmName(client, userId); // "" if no users:read scope
      const by = pmName || `Slack user ${userId}`;
      const title = `${screenName ?? "Screen"}: ${(lastPrompt ?? "").slice(0, 55)} — ${by}`;
      const prUrl = await openProposalPR(
        branch,
        title,
        `🎨 Prototyped by **${by}** (\`<@${userId}>\`) via the Slack prototyper bot, starting from the **${screenName ?? "app"}** screen.\n\n` +
          `**Idea:** ${lastPrompt ?? "—"}\n\n` +
          "Built inside `proposals/` against the design system. Design team: review and rebuild the approved version under `components/` / `screens/`.",
      );
      await queueResult(userId, dmChannel, `✅ *Sent to the design team!* They'll review it here:\n${prUrl}`);

      // Post to the design-team feed so every PM's submission is attributed + linked.
      if (config.reportChannel) {
        const links = sessions.get(userId)?.lastLinks;
        try {
          await client.chat.postMessage({
            channel: config.reportChannel,
            text:
              `🎨 *New prototype proposal* from <@${userId}>\n` +
              `*Screen:* ${screenName ?? "—"}\n` +
              `*Idea:* ${lastPrompt ?? "—"}\n\n` +
              (links ? `${formatLinks(links)}\n\n` : "") + // 📱 fullscreen + 🧩 Storybook
              `🔀 PR: ${prUrl}\n` +
              `🖼 All proposals: ${config.galleryUrl}`,
          });
        } catch (e) {
          console.error("report-channel post failed:", e instanceof Error ? e.message : e);
        }
      }

      // Mirror it into the shared gallery — durably queued (not fire-and-forget)
      // so a restart or a transient build failure can't silently drop it. The
      // processor DMs the PM the permalink on success and retries on failure.
      enqueueGalleryJob({
        branch,
        userId,
        pmLabel: pmName || `PM ${userId}`,
        screenName: screenName ?? "Screen",
        srcFolder: proposalFolder(screenName ?? "Screen"),
        dmChannel,
        attempts: 0,
      });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      await queueResult(userId, dmChannel, `⚠️ Couldn't save it:\n\`\`\`\n${msg.slice(0, 600)}\n\`\`\``);
    } finally {
      busy.delete(userId);
    }
    return;
  }

  // Need a chosen screen before we build anything.
  const session = sessions.get(userId);
  if (!session?.screen) {
    if (!session?.onboarded) {
      await say(INTRO); // first-ever contact → welcome + how it works
      const s = session ?? {};
      s.onboarded = true;
      sessions.set(userId, s);
      persistSessions();
    }
    await showPicker(say as Say, session?.model);
    return;
  }

  // Build or iterate on the proposal for the chosen screen.
  busy.add(userId);
  try {
    // Conversational first: a question gets a text answer (no build); only a
    // concrete change request runs the builder.
    console.log(`[build] ${userId}: triaging "${text.slice(0, 50)}"…`);
    const decision = await triage(text, session.screen.name, !!session.hasProposal, session.model);
    if (decision.mode === "answer") {
      await say(decision.reply ?? "Happy to help — what would you like to change?");
      return;
    }

    session.lastPrompt = text;
    const screen = session.screen;

    // Post the progress bar FIRST — immediate feedback. The first-ever build
    // clones the repo + installs deps (~1-2 min) BEFORE the agent even starts,
    // so without this the PM stares at silence and thinks it died.
    const overallStart = Date.now();
    let phase: "build" | "publish" = "build";
    let phaseStart = Date.now();
    const posted = await say(renderProgress(screen.name, phase, phaseStart, overallStart));
    const ch = posted.channel;
    const ts = posted.ts;
    const canUpdate = typeof ch === "string" && typeof ts === "string";
    const update = (t: string) =>
      canUpdate ? client.chat.update({ channel: ch as string, ts: ts as string, text: t }).catch(() => {}) : say(t);
    const tick = setInterval(() => {
      if (canUpdate) void update(renderProgress(screen.name, phase, phaseStart, overallStart));
    }, 4000);

    try {
      console.log(`[build] ${userId}: ensuring workspace (clone + install)…`);
      const dir = await ensureWorkspace(userId); // first message ever: clones + installs (~1-2 min)
      if (!session.branch) session.branch = await startFreshBranch(userId, dir);
      persistSessions();
      console.log(`[build] ${userId}: running agent on "${screen.name}"…`);
      let lastNote = "";
      const isFollowUp = !!session.hasProposal; // a proposal already exists → refine it
      await runAgent(
        dir,
        text,
        (n) => {
          lastNote = n;
        },
        {
          screenName: screen.name,
          importPath: screen.importPath,
          proposalTitle: proposalTitle(screen.name),
          proposalFolder: proposalFolder(screen.name),
          iterate: isFollowUp,
        },
        session.model,
      );
      await commitLocal(dir, `proposal(${screen.name}): ${text.slice(0, 60)}`);
      // Push EVERY round, not just on save. A round used to live only in this machine's workspace until
      // the PM pressed save, so an unsaved iteration existed solely as a Chromatic build — recoverable
      // by link, gone from git the moment the workspace was wiped. Pushing costs nothing (no PR, no
      // extra build: `chromatic.yml` runs on pull_request) and makes the work durable from round one.
      // Best-effort: a push failure must never cost the PM the prototype they're waiting for.
      try {
        await pushBranch(dir, session.branch);
      } catch (e) {
        console.error(`[build] ${userId}: round push failed (kept locally):`, e instanceof Error ? e.message : e);
      }
      phase = "publish";
      phaseStart = Date.now();
      await update(renderProgress(screen.name, phase, phaseStart, overallStart));
      console.log(`[build] ${userId}: pnpm build + chromatic publish…`);
      const baseUrl = await buildAndPublish(dir);
      const links = await proposalLinks(baseUrl, proposalStoryId(screen.name));
      session.hasProposal = true;
      session.lastLinks = links;
      session.lastLink = undefined; // superseded by lastLinks
      persistSessions();

      const summary = lastNote ? `\n\n_${lastNote.slice(0, 300)}_` : "";
      const done =
        `✅ *Done — here's your prototype:*\n\n${formatLinks(links)}${summary}\n\n` +
        `*What next?*\n` +
        `• Not quite right? Just tell me what to tweak (e.g. *"make it smaller"*).\n` +
        `• Love it? Type *save* → it goes to the design team.\n` +
        `• Different screen? Type *new*.`;
      clearInterval(tick); // stop the ticker before delivering the result
      // Happy path: morph the progress bar into the links. If that send fails
      // (Slack blip), queue it durably so the flusher delivers it on reconnect.
      let delivered = false;
      if (canUpdate) {
        try {
          await client.chat.update({ channel: ch as string, ts: ts as string, text: done });
          delivered = true;
        } catch {
          /* fall through to the durable queue */
        }
      }
      if (!delivered) await queueResult(userId, ch ?? dmChannel, done);
    } finally {
      clearInterval(tick);
    }
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    await queueResult(userId, dmChannel, `⚠️ Something went wrong:\n\`\`\`\n${msg.slice(0, 1500)}\n\`\`\``);
  } finally {
    busy.delete(userId);
  }
});


hydrateSessions(); // restore sessions from a previous run so restarts don't drop context
hydrateGalleryQueue(); // restore pending gallery mirrors so a restart doesn't drop them
void processGalleryQueue(); // recover any mirror the last run was killed mid-flight

// Self-heal: keep retrying any queued (undelivered) result until it lands. This
// is what makes the bot survive a Slack outage of any length or a restart without
// stranding the PM — the link arrives on its own once connectivity returns.
setInterval(() => {
  for (const uid of sessions.keys()) void deliverPending(uid);
}, 15000);

// Drain the shared-gallery queue on a slower cadence (each job is a full ~3-min
// Storybook build, so don't hammer it): retries transient failures and picks up
// anything a restart interrupted. Single-flight, so overlapping ticks are safe.
setInterval(() => void processGalleryQueue(), 60000);

// Socket Mode uses an outbound WebSocket (no inbound port). A tiny health server
// binds $PORT so a host like Railway detects a running, healthy service.
const port = Number(process.env.PORT ?? 3000);
http
  .createServer((_req, res) => res.writeHead(200, { "content-type": "text/plain" }).end("ok"))
  .listen(port);
await app.start();
console.log(
  `⚡ Justlife DS Prototyper bot is running (Socket Mode) — health on :${port}. ` +
    `Model: ${config.agentModel}. Container RAM: ${containerMemMB()}MB`,
);
