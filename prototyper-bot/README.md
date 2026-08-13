# Justlife DS Prototyper — Slack bot

A PM DMs the bot → the bot lists **your existing screens** as buttons → the PM picks
one and gets its **live "before" link** → the PM says what to change in plain language
→ an agent builds it against the real design system in a sandbox → **Chromatic returns
a live "after" link**. If the PM likes it, they write **"kaydet"** and the bot opens a
*Proposal:* PR for the design team. The PM never touches GitHub or a terminal.

```
PM (Slack DM: anything)
      │
      ▼
bot lists your screens ──▶ PM taps one ──▶ "before" preview link (the screen as it is today)
                                                 │
                            PM says what to change ──▶ agent builds in proposals/ ──▶ Chromatic ──▶ "after" link
                                                 │                                        ▲
                                                 └───────────── iterate: type another change ┘
                                                 │
                                     "kaydet" ──▶ push branch + open Proposal PR      "yeni" ──▶ back to picker
```

The screen list is pulled **live** from the published catalog (`index.json`), so it
always matches what's on `main`. WIP screens are hidden via `HIDDEN_SCREENS` (default
`Wallet`).

Runs standalone — **not** part of the design-system pnpm workspace (it lives outside
`packages/`, `apps/`, `tools/`), so it never touches the DS build or CI.

---

## Senin yapman gereken 4 şey (anahtarlar)

`.env.example`'ı `.env`'e kopyala ve şunları doldur:

| Anahtar | Ne / Nereden |
|---|---|
| `ANTHROPIC_API_KEY` | AI'ın yakıtı — **kredi buradan gider**. https://console.anthropic.com → API Keys. |
| `SLACK_*` (3 tane) | Slack app'i (aşağıda tıkla-tıkla). |
| `GITHUB_TOKEN` | Sadece "kaydet"te PR açmak için. Repo'ya **Contents + Pull requests: Read & write** izinli fine-grained PAT (github.com → Settings → Developer settings → Fine-grained tokens). |
| `CHROMATIC_PROJECT_TOKEN` | Canlı önizlemeyi yayınlar. **Zaten var** — repo Secret'ındaki `CHROMATIC_PROJECT_TOKEN` ile aynı değer. |

---

## Slack app kurulumu (~5 dk, tek sefer)

1. **https://api.slack.com/apps → Create New App → From scratch.** İsim: `DS Prototyper`. Workspace'ini seç.
2. **Socket Mode** (sol menü) → aç. "Generate an app-level token" der → scope **`connections:write`** ile üret → `xapp-...` çıkar → **`SLACK_APP_TOKEN`**.
3. **Interactivity & Shortcuts** (sol menü) → **aç**. *(Ekran seçim butonları buradan gelir. Socket Mode olduğu için Request URL istemez — sadece toggle'ı aç.)*
4. **OAuth & Permissions → Bot Token Scopes** → şunları ekle: `chat:write`, `im:history`, `im:read`, `im:write`.
5. **Event Subscriptions** → aç → **Subscribe to bot events** → `message.im` ekle. *(Socket Mode olduğu için URL istemez.)*
6. **App Home** → "Messages Tab"i aç + **"Allow users to send messages from the messages tab"** kutusunu işaretle (DM açılabilsin).
7. **Install to Workspace** (üstte). Sonra:
   - **OAuth & Permissions → Bot User OAuth Token** `xoxb-...` → **`SLACK_BOT_TOKEN`**
   - **Basic Information → Signing Secret** → **`SLACK_SIGNING_SECRET`**

---

## Çalıştır

Node 20+ gerekli. Repo kök klasöründe:

```bash
cd prototyper-bot
npm install
cp .env.example .env      # sonra .env'i doldur
npm start
```

`⚡ … bot is running (Socket Mode)` görürsen hazır. (Hızlı demo için bu bir makinede
açık kalması yeter; kalıcı için Railway/Render gibi bir yere koyarız.)

> `npm install` bir sürüm bulamazsa: `npm install @anthropic-ai/claude-agent-sdk@latest @slack/bolt@latest`

---

## PM nasıl kullanır

1. Slack'te **bota DM** atar (kanal değil, birebir — private). Ne yazdığı önemli değil, *"selam"* bile olur.
2. Bot **senin tasarladığın ekranları** buton buton listeler. PM birini seçer *(ör. "Home Cleaning Funnel")*.
3. Bot o ekranın **şu anki halinin** canlı linkini atar → telefonda açar, mevcut tasarımı görür.
4. Ne değiştirmek istediğini yazar: *"add an 'Earliest Available Slot' card near the top, on-brand."*
5. Bot 1-2 dk sonra **yeni prototipin** canlı, tıklanabilir linkini döner → açar, oynar.
6. Değişiklik: *"biraz küçült"* yazar → yeni link. (İstediği kadar tekrarlar.)
7. Beğendiyse **"kaydet"** → design ekibine *Proposal:* PR olarak gider. Beğenmezse hiçbir şey yapmaz.
   - **"yeni"** yazınca sıfırdan başlar (ekran seçimine döner).

---

## Nasıl çalışıyor (özet)

- **`src/screens.ts`** — yayınlanmış Storybook'un `index.json`'ından **canlı ekran listesini** çeker (WIP olanları `HIDDEN_SCREENS` ile gizler); "before" linkini, proposal story id'sini ve build sonrası "after" deep-link'ini üretir.
- **`src/agent.ts`** — `@anthropic-ai/claude-agent-sdk` (Claude Code kütüphane olarak) ile agent'ı repo klonunda çalıştırır; PM'in seçtiği ekranı bağlam olarak verir. Guardrail: sadece `proposals/` içine yaz, orijinal ekrana/DS componentine dokunma, reuse et.
- **`src/workspace.ts`** — her kullanıcıya bir klon + `proposals/` branch'i; `pnpm build` + `chromatic` ile yayınlar, linki döner.
- **`src/github.ts`** — "kaydet"te branch'i push edip *Proposal:* PR açar.
- **`src/index.ts`** — Slack Bolt (Socket Mode): ekran picker'ı (butonlar), seçim → "before" link, mesaj → build → "after" link, "kaydet"/"yeni".

Güvenlik: agent `proposals/` sandbox'ında; hiçbir şey sizin review'unuz (CODEOWNERS) olmadan main'e giremez.
