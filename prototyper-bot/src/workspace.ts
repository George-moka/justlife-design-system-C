import { access, mkdir, cp, rm, readdir, readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { config } from "./config.js";
import { run, runOrThrow, pnpm } from "./run.js";

const WORKSPACES = path.join(process.cwd(), "workspaces");
const repoDir = (userId: string) =>
  path.join(WORKSPACES, userId.replace(/[^a-zA-Z0-9_-]/g, ""), "repo");

/**
 * The container's real memory limit in MB — reads the cgroup limit (Node's
 * os.totalmem() reports the HOST, not the container, so a heap cap based on it
 * would be wrong). Falls back to host memory when there's no cgroup limit.
 */
export function containerMemMB(): number {
  for (const p of ["/sys/fs/cgroup/memory.max", "/sys/fs/cgroup/memory/memory.limit_in_bytes"]) {
    try {
      const raw = readFileSync(p, "utf8").trim();
      if (raw === "max") continue;
      const bytes = Number(raw);
      if (bytes > 0 && bytes < 1e15) return Math.floor(bytes / 1024 / 1024);
    } catch {
      /* not this cgroup layout */
    }
  }
  return Math.floor(os.totalmem() / 1024 / 1024);
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");

const git = (args: string[], cwd: string) => run("git", args, { cwd });
const gitOrThrow = (args: string[], cwd: string) => runOrThrow("git", args, { cwd });
const cloneUrl = () => `https://x-access-token:${config.githubToken}@github.com/${config.repo}.git`;

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Clone the repo once per user, install deps. Returns the repo working dir. */
export async function ensureWorkspace(userId: string): Promise<string> {
  const dir = repoDir(userId);
  if (!(await exists(path.join(dir, ".git")))) {
    await mkdir(path.dirname(dir), { recursive: true });
    await gitOrThrow(["clone", "--no-tags", cloneUrl(), dir], process.cwd());
    await gitOrThrow(["config", "user.email", "prototyper-bot@justlife.local"], dir);
    await gitOrThrow(["config", "user.name", "Justlife Prototyper Bot"], dir);
    await pnpm(["install", "--frozen-lockfile"], dir); // pnpm store is shared → fast
  }
  return dir;
}

/** Discard any prior work and cut a fresh proposal branch off the latest base. */
export async function startFreshBranch(userId: string, dir: string): Promise<string> {
  await gitOrThrow(["fetch", "origin", config.baseBranch], dir);
  await gitOrThrow(["reset", "--hard"], dir);
  await gitOrThrow(["clean", "-fd"], dir);
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
  const branch = `ds-proposal/${safe}-${Date.now().toString(36)}`;
  await gitOrThrow(["checkout", "-B", branch, `origin/${config.baseBranch}`], dir);
  return branch;
}

/**
 * Recover a user's current proposal from their clone — git is the durable source
 * of truth, so "save" still works after the bot restarts and drops its in-memory
 * session. Returns the branch + screen/prompt parsed from the last commit.
 */
export async function inspectWorkspace(
  userId: string,
): Promise<{ branch: string; screenName?: string; lastPrompt?: string } | null> {
  const dir = repoDir(userId);
  if (!(await exists(path.join(dir, ".git")))) return null;
  const branch = (await git(["rev-parse", "--abbrev-ref", "HEAD"], dir)).stdout.trim();
  if (!branch.startsWith("ds-proposal/")) return null;
  const ahead = (await git(["rev-list", "--count", `origin/${config.baseBranch}..HEAD`], dir)).stdout.trim();
  if (!ahead || ahead === "0") return null; // nothing built yet
  const subject = (await git(["log", "-1", "--format=%s", "HEAD"], dir)).stdout.trim();
  const m = subject.match(/^proposal\(([^)]+)\):\s*(.*)$/); // "proposal(<Screen>): <text>"
  return { branch, screenName: m?.[1]?.trim(), lastPrompt: m?.[2]?.trim() };
}

/** Commit the agent's work locally (no push needed to preview). */
export async function commitLocal(dir: string, message: string): Promise<void> {
  await gitOrThrow(["add", "-A"], dir);
  const status = await gitOrThrow(["status", "--porcelain"], dir);
  if (status.stdout.trim()) await gitOrThrow(["commit", "-m", message], dir);
}

/** Push the branch to origin (used when a PM saves the proposal). */
export async function pushBranch(dir: string, branch: string): Promise<void> {
  await gitOrThrow(["push", "-u", "origin", branch, "--force"], dir);
}

/** Build Storybook and publish it to Chromatic. Returns the live preview URL. */
export async function buildAndPublish(dir: string, branchName?: string): Promise<string> {
  // Cap V8's heap to the container's real RAM so the Storybook build (heavy) GCs
  // instead of over-allocating past the cgroup limit and getting OOM-killed (137).
  const heapMB = Math.max(512, Math.floor(containerMemMB() * 0.8));
  await runOrThrow("corepack", ["pnpm@9.15.0", "build"], {
    cwd: dir,
    env: { NODE_OPTIONS: `--max-old-space-size=${heapMB}` },
  }); // turbo: tokens → ui → storybook (apps/storybook/storybook-static)
  const args = [
    "pnpm@9.15.0",
    "dlx",
    "chromatic",
    "--project-token",
    config.chromaticToken,
    "--storybook-build-dir",
    "apps/storybook/storybook-static",
    "--exit-once-uploaded",
    "--ci",
  ];
  if (branchName) args.push("--branch-name", branchName); // pin the permalink (…<branch>--<appId>)
  const r = await run("corepack", args, { cwd: dir, timeoutMs: 15 * 60 * 1000 });
  const out = `${r.stdout}\n${r.stderr}`;
  if (r.code !== 0 && !/Storybook published/i.test(out)) {
    throw new Error(`Chromatic publish failed (exit ${r.code}).\n${out.slice(-1500)}`);
  }
  // e.g. "ℹ View your Storybook at https://<appid>-<hash>.chromatic.com/"
  const url = out
    .split("\n")
    .map((l) => l.match(/https:\/\/[a-z0-9-]+\.chromatic\.com\/?\S*/i)?.[0])
    .find((u): u is string => !!u && !/\/\/(docs|www|status|index)\./.test(u));
  if (!url) throw new Error(`Published, but couldn't find the preview link.\n${out.slice(-1500)}`);
  return url.replace(/[.,)\]]+$/, "");
}

// ── The shared "all proposals" gallery ────────────────────────────────────────
// A single persistent branch every saved proposal is added to, published to one
// stable Chromatic permalink. Namespaced per user so nothing collides; grouped by
// PM name in the sidebar. Updates are serialized (single-process bot).

const galleryDir = path.join(WORKSPACES, "_gallery", "repo");
let galleryLock: Promise<unknown> = Promise.resolve();

/** Run gallery mutations one at a time so concurrent saves don't clash on the branch. */
function withGalleryLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = galleryLock.then(fn, fn);
  galleryLock = next.then(
    () => {},
    () => {},
  );
  return next;
}

/** Clone-once + hard-reset the gallery clone onto the latest gallery branch (or main if new). */
async function ensureGalleryCheckout(): Promise<string> {
  if (!(await exists(path.join(galleryDir, ".git")))) {
    await mkdir(path.dirname(galleryDir), { recursive: true });
    await gitOrThrow(["clone", "--no-tags", cloneUrl(), galleryDir], process.cwd());
    await gitOrThrow(["config", "user.email", "prototyper-bot@justlife.local"], galleryDir);
    await gitOrThrow(["config", "user.name", "Justlife Prototyper Bot"], galleryDir);
    await pnpm(["install", "--frozen-lockfile"], galleryDir);
  }
  await gitOrThrow(["fetch", "origin"], galleryDir);
  const remote = (await git(["ls-remote", "--heads", "origin", config.galleryBranch], galleryDir)).stdout.trim();
  const start = remote ? `origin/${config.galleryBranch}` : `origin/${config.baseBranch}`;
  await gitOrThrow(["checkout", "-B", config.galleryBranch, start], galleryDir);
  await gitOrThrow(["reset", "--hard", start], galleryDir);
  await gitOrThrow(["clean", "-fd"], galleryDir);
  return galleryDir;
}

/** Rewrite the story title in every `.stories.*` under a folder so it groups by PM. */
async function retitleStories(folder: string, screenName: string, newTitle: string): Promise<void> {
  const oldTitle = `Proposals/${screenName}`;
  for (const f of await readdir(folder)) {
    if (!f.includes(".stories.")) continue;
    const p = path.join(folder, f);
    const content = await readFile(p, "utf8");
    if (content.includes(oldTitle)) await writeFile(p, content.split(oldTitle).join(newTitle));
  }
}

export interface GalleryItem {
  branch: string; // the PM's pushed proposal branch — an immutable, race-free source
  userId: string; // namespaces the folder so PMs never collide
  pmLabel: string; // display name used to group in the sidebar
  screenName: string;
  srcFolder: string; // proposal folder name, e.g. "Profile"
}

/**
 * Stage one proposal from its pushed branch into the gallery working tree —
 * extract the folder, namespace it per-PM, retitle its stories. No commit /
 * push / build; the caller decides when to persist (one build for many items).
 */
async function stageProposalIntoGallery(dir: string, opts: GalleryItem): Promise<void> {
  await gitOrThrow(["fetch", "origin", opts.branch], dir);
  const relSrc = `packages/ui/src/proposals/${opts.srcFolder}`;
  const orig = path.join(dir, relSrc);
  await rm(orig, { recursive: true, force: true });
  // Extract just the proposal folder from the PM's pushed branch.
  const co = await git(["checkout", `origin/${opts.branch}`, "--", relSrc], dir);
  if (co.code !== 0 || !(await exists(orig))) {
    throw new Error(`gallery: couldn't extract ${relSrc} from ${opts.branch}`);
  }
  const dest = path.join(dir, "packages/ui/src/proposals", `${slug(opts.userId)}-${slug(opts.screenName)}`);
  await rm(dest, { recursive: true, force: true });
  await cp(orig, dest, { recursive: true });
  await rm(orig, { recursive: true, force: true }); // drop the un-namespaced copy
  await retitleStories(dest, opts.screenName, `Proposals/${opts.pmLabel}/${opts.screenName}`);
  await gitOrThrow(["add", "-A"], dir); // stage now so the next item's extract starts clean
}

/**
 * Add/refresh a PM's proposal in the shared gallery and publish it. Returns the
 * stable gallery permalink. Serialized; safe under concurrent saves.
 */
export async function addToGallery(opts: GalleryItem): Promise<string> {
  return withGalleryLock(async () => {
    const dir = await ensureGalleryCheckout();
    await stageProposalIntoGallery(dir, opts);
    if ((await gitOrThrow(["status", "--porcelain"], dir)).stdout.trim()) {
      await gitOrThrow(["commit", "-m", `gallery: ${opts.pmLabel} — ${opts.screenName}`], dir);
      await gitOrThrow(["push", "-u", "origin", config.galleryBranch], dir);
    }
    await buildAndPublish(dir, config.galleryBranch);
    return config.galleryUrl;
  });
}

/**
 * Backfill many proposals into the gallery in one shot: stage every item, then
 * commit + push + build ONCE. Used to recover proposals whose background
 * gallery-add failed (e.g. a container restart) — their pushed branches are the
 * durable source, so this is safe to re-run and idempotent per (userId, screen).
 */
export async function backfillGallery(items: GalleryItem[]): Promise<string> {
  return withGalleryLock(async () => {
    const dir = await ensureGalleryCheckout();
    for (const opts of items) await stageProposalIntoGallery(dir, opts);
    if ((await gitOrThrow(["status", "--porcelain"], dir)).stdout.trim()) {
      await gitOrThrow(["commit", "-m", `gallery: backfill ${items.length} proposal(s)`], dir);
      await gitOrThrow(["push", "-u", "origin", config.galleryBranch], dir);
    }
    await buildAndPublish(dir, config.galleryBranch);
    return config.galleryUrl;
  });
}
