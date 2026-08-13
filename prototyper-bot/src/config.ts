import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    console.error(`\n❌ Missing required env var: ${name}\n   Copy .env.example to .env and fill it in.\n`);
    process.exit(1);
  }
  return v.trim();
}

// The stable, public Storybook catalog for `main` (…main--<appId>.chromatic.com).
const MAIN_SB = (
  process.env.MAIN_STORYBOOK_URL?.trim() || "https://main--6a4f941f1c2dd655ffb192cb.chromatic.com"
).replace(/\/+$/, "");

export const config = {
  anthropicApiKey: required("ANTHROPIC_API_KEY"),
  slackBotToken: required("SLACK_BOT_TOKEN"),
  slackAppToken: required("SLACK_APP_TOKEN"),
  slackSigningSecret: required("SLACK_SIGNING_SECRET"),
  githubToken: required("GITHUB_TOKEN"),
  chromaticToken: required("CHROMATIC_PROJECT_TOKEN"),

  repo: process.env.GITHUB_REPO?.trim() || "justlifedesignstudio/justlife-design-system",
  baseBranch: process.env.BASE_BRANCH?.trim() || "main",
  agentModel: process.env.AGENT_MODEL?.trim() || "claude-opus-5",

  // (a) list the screens a PM can start from, (b) deep-link the "before" preview.
  mainStorybookUrl: MAIN_SB,

  // The persistent "all proposals" gallery: a branch every save is added to, and
  // its stable Chromatic permalink (…proposals-gallery--<appId>.chromatic.com).
  galleryBranch: "proposals-gallery",
  galleryUrl: MAIN_SB.replace("main--", "proposals-gallery--"),

  // Screens hidden from the picker (WIP / not ready for PMs). Comma-separated names.
  hiddenScreens: (process.env.HIDDEN_SCREENS ?? "Wallet")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  // Optional Slack channel (id like C0123ABCD or name like "report-designsystem")
  // the bot posts to when a PM saves a proposal — the design team's feed. The bot
  // must be a member of it. Empty = no channel post.
  reportChannel: process.env.REPORT_CHANNEL?.trim() || "",
} as const;

export const [repoOwner, repoName] = config.repo.split("/") as [string, string];
