# Funnel & Profile — component promotion audit

> **Scope note (2026-06-29):** this audit covers **Funnel + Profile only**. The newer **Wallet** screen
> (`screens/WalletScreen.tsx`, committed `eb86732` but **not baked**) still holds its helpers as local in-file
> functions — a Wallet promotion pass is **owed as a follow-up** (see `HANDOFF.md` §33).

> Status: **DONE** (2026-06-23). Executed as a 5-bake pass; summary in `HANDOFF.md` §24. Kept as the
> decision record (naming + reconciliation). **Outcome:** 10 atoms promoted — `Selectable` ·
> `DatePicker` · `TimeSlotPicker` · `WeekdayPicker` · `NumberSelector` · `PillGroup` · `Question` ·
> `PlanSelectCard` (on `SelectableCard`) · `PromiseList` · `ScreenAurora` (de-duped from both screens).
> Plus two systemic fixes: `SelectableCard` now announces `accessibilityState.selected`, and `Radio` gained
> `interactive={false}` (decorative, a11y-hidden) to kill the nested-interactive radio-in-button pattern.
> Step bodies renamed to `FrequencyStep`/`ServiceStep`/`AddOnsStep`/`DateTimeStep`/`CheckoutStep`. Every
> step was an import-only screen refactor with no visual change, verified in Storybook + baked.
>
> **Overlap-set follow-up (`2d8fcf4`):** the deferred set did **not** fold into existing components after all
> (the disclaimer is neutral-grey, unlike `InfoCard`'s coloured tones; the voucher mini-pair ≠ the full
> `VoucherCodeCard`), so two were promoted as **new** components: **`Disclaimer`** (neutral callout) and
> **`MiniActionCard`** (merges the old `MiniActionCard` + `AppliedVoucherCard` into one default/applied tile).
> The voucher's `Confetti` stays in the funnel (screen-specific). **`ProChoice` kept inline** (most
> funnel-specific). Net: **12 components promoted**, 64 files / 247 tests.

## Why this exists

The screens were built **design-in-context** (compose on the screen, get it approved) with the
**promote-to-components** step deferred. That step is now owed: several genuinely reusable pieces live as
**local, in-file functions** in the screen files — not exported, no stories, no docs, no tests — which
violates the house rule *"reuse the real DS components — don't hand-roll or duplicate."* This audit lists
every in-file helper, says whether it should be **promoted / kept inline / de-duped**, and proposes names +
how each reconciles with components that already exist (so we extend, not duplicate).

Scope: [`HomeCleaningFunnelScreen.tsx`](../packages/ui/src/screens/HomeCleaningFunnelScreen.tsx) and
[`ProfileScreen.tsx`](../packages/ui/src/screens/ProfileScreen.tsx).

## What is already correct

- **Funnel reuses real DS containers:** `Header`, `PageShell`, `Card`, `BottomSheet`, `CheckoutBar`,
  `StepIndicator`, `InfoCard`, `PaymentMethodCard`, `PriceDetails`, `AddOnsCard`, `SpecialInstructions`,
  `Button`, `Radio`, `Collapsible`, `Confetti`.
- **Profile's new atoms were already promoted:** `Avatar`, `ListRow`, `InfoCard.action` (stories + docs +
  tests). Profile's only inline helper is `HeaderAurora` (see de-dupe below).

## Step numbering (correcting a stale name)

The in-file step bodies are misnamed (they predate the Frequency step becoming step 1). Actual flow:

| Step | Title | In-file function (current → rename) |
|---|---|---|
| 1 | Frequency | `FrequencyContent` → `FrequencyStep` |
| 2 | Home Cleaning | `Step1Content` → `ServiceStep` |
| 3 | Popular Add-ons | `Step2Content` → `AddOnsStep` |
| **4** | **Date & Time** | `Step3Content` → `DateTimeStep` |
| 5 | Checkout | `Step4Content` → `CheckoutStep` |

(The step bodies themselves **stay inline** — they're screen-specific compositions. Only the names change.)

## Inventory & disposition

Legend — **Promote**: extract to `@justlife/ui` with stories/docs/tests. **Inline**: screen-specific, stays.
**De-dupe**: defined twice, consolidate.

### Foundation (do first — everything else builds on it)

| Helper | Disposition | Proposed name | Reconciliation |
|---|---|---|---|
| `Selectable` (chip) | **Promote** | `Selectable` | The chip-level selectable (brand fill + border on select). Distinct from the existing **`SelectableCard`** (a large card). Open: keep `Selectable` or call it `Chip`/`SelectableChip`? |

### Pickers (thin compositions over `Selectable`)

| Helper | Disposition | Proposed name | Reconciliation |
|---|---|---|---|
| date strip (in step 4) | **Promote** | `DatePicker` (a.k.a. `DateStrip`) | Horizontal day-of-week + date chips, single-select. Net-new. |
| time slots (in step 4) | **Promote** | `TimeSlotPicker` | Horizontal time-range chips, single-select. Net-new. |
| weekday picker (in `RecurringExpansion`) | **Promote** | `WeekdayPicker` | 7 single-letter chips, **multi-select**. Net-new. |
| `NumberRow` | **Promote** | `NumberSelector` | Segmented count chips (1…n). Distinct from **`QuantityStepper`** (− / + control). |
| `Pills` | **Promote** | `PillGroup` | Single-select label pills. Distinct from **`TabGroup`** (navigation tabs). |

### Other reusable atoms

| Helper | Disposition | Proposed name | Reconciliation |
|---|---|---|---|
| `Question` | **Promote** | `Question` | Labelled section: title (+ inline info icon) over its control. Open: `Question` vs `Field`/`FormSection`? |
| `FrequencyCard` | **Promote** | `PlanSelectCard` | Selectable plan card: radio + title + discount badge + "Most Popular" ribbon + bullets + expansion slot. Reconcile against **`SelectableCard`** / **`PlanBookingCard`** — likely **build on `SelectableCard`** rather than a new shell. |
| `JustlifePromise` | **Promote** | `PromiseList` | Brand reassurance list (icon + title + desc rows, divider between). Content stays caller-supplied. |
| `HeaderAurora` | **De-dupe** | `ScreenAurora` | **Byte-identical** in both screens (paper base + 2 brand glows). Promote once, both import it. |
| `Bullet` | Promote *(low)* | `CheckListItem` | Tiny check-icon + text row. Trivial; bundle with `PromiseList` or defer. |

### Reconcile-or-defer (overlap existing components — decide case by case)

> **Outcome (`2d8fcf4`):** none folded into the existing components (they didn't fit). `CancellationDisclaimer`
> → promoted as new **`Disclaimer`**; `AppliedVoucherCard` + `MiniActionCard` → merged into new
> **`MiniActionCard`**; **`ProChoice`** / `ProAvatar` and `ServiceSummaryCard` → **kept inline**.

| Helper | Note |
|---|---|
| `ProChoice` / `ProAvatar` (step 4 pro chooser) | Overlaps existing **`ProfessionalCard`** / **`ProfessionalAvatar`**. Reconcile into a selectable `ProfessionalChoice` rather than a 3rd avatar. |
| `AppliedVoucherCard` | Overlaps **`VoucherCodeCard`**. Fold in or keep inline. |
| `CancellationDisclaimer` | Basically an `InfoCard` tone variant. Reconcile into `InfoCard`. |
| `MiniActionCard` | Overlaps **`ActionRow`** / **`FlexCard`**. Probably keep inline. |
| `ServiceSummaryCard` | Checkout-summary-specific (drives `PriceDetails`). Keep inline. |

### Stays inline (screen-specific)

`MissingLogo` (dev-only green placeholder), the 5 step bodies (renamed), and the BottomSheet contents
(`ChangePaymentSheet`, `InstructionsSheet`, `VoucherSheet`, `CancellationPolicySheet`).

## Proposed extraction order

1. **`Selectable`** — foundation; nothing else can be clean until this exists.
2. **`DatePicker`, `TimeSlotPicker`, `WeekdayPicker`** — booking-critical, all thin over `Selectable`.
3. **`NumberSelector`, `PillGroup`** — the remaining `Selectable` groups.
4. **`Question`** — the section wrapper (used across steps).
5. **`PlanSelectCard`** — reconcile against `SelectableCard` first.
6. **`PromiseList`** + **`ScreenAurora`** de-dupe + step-body renames.
7. **Reconcile-or-defer** set, case by case.

Each step: build the component (stories/docs/tests) → refactor the screen to import it → **no visual change**
(verify computed styles in Storybook + native parity later) → green gate → **bake** (commit + push).

## Open decisions (need a nod before extracting)

1. **`Selectable`** the name — keep it, or `Chip` / `SelectableChip`?
2. **`Question`** the name — keep it, or `Field` / `FormSection`?
3. **`PlanSelectCard`** — build it **on top of `SelectableCard`**, or as its own shell?
4. **Pickers** — happy with `DatePicker` / `TimeSlotPicker` / `WeekdayPicker` / `NumberSelector` /
   `PillGroup`?
5. **Reconcile set** (pro chooser, voucher, disclaimer) — fold into existing components now, or defer to a
   later batch and keep them inline for this pass?
