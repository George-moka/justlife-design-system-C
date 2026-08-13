# Justlife DS Prototyper — Slack (Socket Mode) worker.
# Runs the bot 24/7: it clones the design-system repo, runs the Claude Agent SDK,
# builds Storybook (pnpm), and publishes to Chromatic.
FROM node:22-bookworm-slim

# git — the bot clones the design-system repo at runtime.
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# pnpm via corepack — the cloned repo builds with pnpm@9.15.0.
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

WORKDIR /app

# Install the bot's own deps (incl. tsx — the bot runs via tsx).
COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .

# Run as non-root: the Claude Code CLI refuses --dangerously-skip-permissions
# (permissionMode: "bypassPermissions") when running as root, for safety.
RUN chown -R node:node /app
USER node
ENV HOME=/home/node

RUN git config --global --add safe.directory '*' \
  && git config --global user.email "prototyper-bot@justlife.local" \
  && git config --global user.name "Justlife Prototyper Bot"
# Warm the pnpm download into this user's corepack cache (best-effort).
RUN corepack pnpm@9.15.0 --version >/dev/null 2>&1 || true

# Socket Mode = outbound WebSocket; a tiny health server also binds $PORT.
CMD ["npm", "start"]
