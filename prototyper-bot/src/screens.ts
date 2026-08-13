import { config } from "./config.js";

/** One entry in the picker — a real screen the PM can start from. */
export interface Screen {
  /** Human label, e.g. "Home Cleaning Funnel". */
  name: string;
  /** Representative story to preview (first non-Docs story of the group). */
  storyId: string;
  /** Repo-relative story path, e.g. "packages/ui/src/screens/HomeCleaningFunnel.stories.tsx". */
  importPath: string;
}

/**
 * Last-resort list for when the live catalog can't be fetched at all — a frozen snapshot, so it goes
 * stale by design. Don't add new screens here: `listScreens()` reads the published `index.json`, so a
 * screen appears the moment its Chromatic build lands on the branch `MAIN_STORYBOOK_URL` points at.
 * A screen missing from the picker means it hasn't been published there yet, not that this list is out
 * of date.
 */
const FALLBACK: Screen[] = [
  { name: "Home Cleaning Funnel", storyId: "screens-home-cleaning-funnel--step-1-frequency", importPath: "packages/ui/src/screens/HomeCleaningFunnel.stories.tsx" },
  { name: "Bookings",             storyId: "screens-bookings--upcoming",                      importPath: "packages/ui/src/screens/Bookings.stories.tsx" },
  { name: "Booking Details",      storyId: "screens-booking-details--default",                importPath: "packages/ui/src/screens/BookingDetails.stories.tsx" },
  { name: "Thank You",            storyId: "screens-thank-you--confirmed",                    importPath: "packages/ui/src/screens/ThankYou.stories.tsx" },
  { name: "Onboarding",           storyId: "screens-onboarding--flow",                        importPath: "packages/ui/src/screens/Onboarding.stories.tsx" },
  { name: "Profile",              storyId: "screens-profile--my-account",                     importPath: "packages/ui/src/screens/Profile.stories.tsx" },
  { name: "Women's Salon",        storyId: "screens-women-s-salon--bestsellers",              importPath: "packages/ui/src/screens/WomensSalon.stories.tsx" },
];

/** Storybook's importPath is relative to the SB config dir — normalise to repo-relative. */
const toRepoPath = (importPath: string) =>
  (importPath ?? "").replace(/^(\.\.?\/)+/, "").replace(/^\/+/, "");

/** The story-id slug Storybook derives from a title/name (matches the live index.json). */
export const sanitize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");

const isHidden = (name: string) =>
  config.hiddenScreens.some((h) => h.toLowerCase() === name.toLowerCase());

/**
 * The catalog is cached, but only for `CACHE_TTL_MS`. It used to be cached for the process's life, which
 * quietly made a redeploy the only way to publish a screen: the design system could merge, Chromatic
 * could rebuild, and a running bot would still offer yesterday's list. A short window keeps the picker
 * snappy while letting the catalog be the source of truth it was meant to be.
 */
const CACHE_TTL_MS = 5 * 60_000;
let cache: { at: number; screens: Screen[] } | null = null;

/** The screens a PM can prototype against — pulled live from the published catalog. */
export async function listScreens(): Promise<Screen[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.screens;
  try {
    const res = await fetch(`${config.mainStorybookUrl}/index.json`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`index.json → HTTP ${res.status}`);
    const json = (await res.json()) as {
      entries?: Record<string, StoryIndexEntry>;
      stories?: Record<string, StoryIndexEntry>;
    };
    const entries = Object.values(json.entries ?? json.stories ?? {});
    const groups = new Map<string, Screen>();
    for (const e of entries) {
      const title = e.title ?? "";
      if (!title.startsWith("Screens/")) continue;
      if (e.type === "docs" || e.name === "Docs") continue; // skip the autodocs page
      const name = title.slice("Screens/".length);
      if (isHidden(name) || groups.has(title)) continue;
      groups.set(title, { name, storyId: e.id, importPath: toRepoPath(e.importPath) });
    }
    const arr = [...groups.values()];
    if (arr.length) {
      cache = { at: Date.now(), screens: arr };
      return arr;
    }
  } catch (err) {
    console.warn(`⚠️  listScreens: using fallback list — ${(err as Error).message}`);
  }
  const fallback = FALLBACK.filter((s) => !isHidden(s.name));
  // Don't cache a fallback for the full window — the catalog may be one retry away.
  cache = { at: Date.now() - CACHE_TTL_MS / 2, screens: fallback };
  return fallback;
}

interface StoryIndexEntry {
  id: string;
  title?: string;
  name?: string;
  importPath: string;
  type?: string;
}

/** The stable "before" link for a screen — full Storybook so the PM can navigate its states. */
export const screenPreviewUrl = (storyId: string) =>
  `${config.mainStorybookUrl}/?path=/story/${storyId}`;

/** The proposal a change becomes — one canonical story per selected screen. */
export const proposalTitle = (screenName: string) => `Proposals/${screenName}`;
export const proposalStoryId = (screenName: string) =>
  `${sanitize(proposalTitle(screenName))}--default`;
/** PascalCase folder/file base for the proposal, e.g. "Women's Salon" → "WomensSalon". */
export const proposalFolder = (screenName: string) =>
  screenName
    .replace(/['’]/g, "") // "Women's" → "Womens", not "Women S"
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

export interface ProposalLinks {
  fullscreen: string; // the raw prototype, no Storybook chrome — what a PM wants
  storybook: string; // the same story inside the Storybook UI (sidebar to navigate)
}

/**
 * Turn a fresh Chromatic build URL into links to the proposal story — both the
 * clean fullscreen view (`iframe.html`) and the Storybook-UI view (`?path`).
 * Prefers the exact expected id; falls back to whatever `Proposals/*` story the
 * build actually contains; finally to the computed id if the index is
 * unreachable. Best-effort — never throws.
 */
export async function proposalLinks(baseUrl: string, expectedStoryId: string): Promise<ProposalLinks> {
  const base = baseUrl.replace(/\/+$/, "");
  let id = expectedStoryId;
  try {
    const res = await fetch(`${base}/index.json`, { signal: AbortSignal.timeout(10_000) });
    if (res.ok) {
      const json = (await res.json()) as { entries?: Record<string, StoryIndexEntry> };
      const entries = Object.values(json.entries ?? {});
      const proposals = entries.filter(
        (e) => (e.title ?? "").startsWith("Proposals/") && e.type === "story" && e.name !== "Docs",
      );
      const pick = proposals.find((e) => e.id === expectedStoryId) ?? proposals[0];
      if (pick) id = pick.id;
    }
  } catch {
    /* fall through to the computed id */
  }
  return {
    fullscreen: `${base}/iframe.html?id=${id}&viewMode=story`,
    storybook: `${base}/?path=/story/${id}`,
  };
}
