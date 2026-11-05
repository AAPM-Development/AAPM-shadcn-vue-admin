# AAPM UI (Vue) — B2b Decisions & Lifecycle Design

|             |                                                                                                                                                                                                                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date        | 2026-11-06                                                                                                                                                                                                                                                                                                                   |
| Status      | Approved in conversation; awaiting written-spec review                                                                                                                                                                                                                                                                       |
| Sub-project | B2b of B2 (B2a navigation & context, B2c data & reports come later)                                                                                                                                                                                                                                                          |
| Builds on   | B1 foundation: `src/design-system/states.ts` (semantic vocabulary), `StateChip`, `FreshnessIndicator`, `capabilities.ts`                                                                                                                                                                                                     |
| Sources     | `AAPM_Ecosystem` @ `a75b57d` `ECOSYSTEM_UI_CAPABILITY_REQUIREMENTS.md`: §8 action availability contract, §9 lifecycle recipes, §9.2 UI-WRK-READINESS, §7 revision/provenance minimum contract, §18 quality. `erp.aapm.co.id` `UI_UX_REQUIREMENTS.md` UX-05 and UX-06; `PLATFORM_CAPABILITY_WIRING.md` PC05, PC09, PC11, PC17 |

## Goal

The AAPM Vue template gets the reusable patterns behind every consequential ERP step:

- check readiness;
- explain why an action is unavailable;
- decide;
- correct;
- record progress;
- show what changed, who changed it and why.

These patterns are generic. They never own business rules, permissions or persistence.

## Decisions (from the user)

- **Approach A: typed contracts, then small leaf components, then recipes.** Recipes compose the leaf components. This follows the Ecosystem guidance ("typed recipe first, not a monolithic component"). Two alternatives were declined:
  - large workspace components, because they are rigid;
  - headless composables only, because the visuals would be inconsistent.
- **Definition of done:** every component and recipe has its own `/ui-kit` demo, plus one end-to-end flow, **"Koreksi penerimaan barang"**, which B3 reuses.

## Scope: 14 capability rows

| ID               | Requirement                                | Delivered by                                            |
| ---------------- | ------------------------------------------ | ------------------------------------------------------- |
| UI-WRK-READINESS | Readiness / eligibility / blocker review   | `ReadinessReview`                                       |
| UI-FRM-008       | Row/record action availability with reason | `ReasonedAction`                                        |
| UI-FRM-007       | Consequential decision form                | `DecisionForm`                                          |
| UI-FRM-011       | Correction form                            | `CorrectionForm`                                        |
| UI-FRM-010       | Append-only progress / realization entry   | `ProgressLog`                                           |
| UI-DAT-010       | Revision / change summary                  | `RevisionDiff`                                          |
| UI-DAT-017       | Immutable activity / audit narrative       | `ActivityFeed`                                          |
| UI-DAT-007       | Record summary / key-value facts           | `KeyValueList`                                          |
| UI-DAT-011       | Related objects                            | `RelatedObjects`                                        |
| UI-DAT-012       | Entity 360                                 | `Entity360`                                             |
| PC05             | Company readiness / onboarding             | `ReadinessReview` instance (onboarding demo)            |
| PC09             | Approval / delegation                      | `ApprovalDelegation`                                    |
| PC11             | Audit and lineage                          | `ActivityFeed` + `RevisionDiff` with source/correlation |
| PC17             | Settings and feature availability          | `FeatureGate`                                           |

After B2b, each of these rows becomes `ada` with a demo anchor, or `sebagian` with a note when a server-side part is out of reach.

## Constraints

- **B1 constraints still hold:**
  - `components/ui/**` stays stock;
  - colours come only through tokens, the semantic states and tones;
  - Bahasa Indonesia copy;
  - light and dark themes;
  - text contrast ≥ 4.5:1;
  - colour is never the only signal;
  - no new dependencies.
- **No business logic in components.** Readiness results, blockers, eligibility, approvers, delegation and feature settings are computed by the consumer or the server and passed in as data. Components display them and emit intents (`resolve`, `submit`, `retry`, …); they never mutate business state. Every visible state comes from the B1 vocabulary through `stateMeta`.
- **Placement and boundaries:**
  - Components live in `src/components/aapm/work/**`.
  - Contracts live in `src/design-system/contracts/**`.
  - The B1 import boundary applies to both.
  - The demo flow's state machine lives in `src/pages/ui-kit/components/**` only.
- **Backward compatibility:**
  - `ApprovalTimeline` (`events`, `terminal`) keeps its props, and so does `AuditDrawer`.
  - `TimelineEvent` stays exported as a compatible subset of `ActivityEntry`.
- **Quality (Ecosystem §18):** each component needs:
  - landmarks and roles;
  - keyboard operation and visible focus;
  - accessible names;
  - state text that is independent of colour and icon;
  - focus trap and restore in overlays;
  - no page-level horizontal scroll at 320 px;
  - long-label stress handling;
  - units retained;
  - loading, empty and error states;
  - reduced motion.

## Contracts (`src/design-system/contracts/`)

```ts
// lifecycle.ts — all types; the only runtime exports are the mappers below
export type ReadinessResult = 'ready' | 'blocked' | 'incomplete' | 'unknown'
export interface ActionRef { label: string, to?: string, intent?: string }
export interface Blocker { code: string, title: string, reason: string, resolution?: string, source?: ActionRef }
export interface Readiness {
  subject: string // "Koreksi GRN-2611-0086"
  result: ReadinessResult
  evaluatedAt?: Date | number
  blockers: Blocker[] // order supplied by the consumer and kept as given
  satisfied?: string[]
  next?: ActionRef
}

export type ActionAvailability
  = | { state: 'available' }
    | { state: 'disabled', reason: string }
    | { state: 'loading' }
    | { state: 'done', note?: string }

export interface Evidence { label: string, href?: string, kind?: 'file' | 'photo' | 'link' }
export interface Revision {
  field: string
  before: string
  after: string // display strings, units included ("1.200 kg")
  reason?: string
  actor: string
  at: Date | number
  evidence?: Evidence[]
  stateBefore?: SemanticState
  stateAfter?: SemanticState
}

export type ActivityKind = 'created' | 'submitted' | 'returned' | 'approved' | 'rejected' | 'posted' | 'reversed' | 'commented' | 'corrected' | 'reopened' | 'delegated' | 'progress'
export interface ActivityEntry {
  id: string
  kind: ActivityKind
  actor: string
  role?: string
  at: Date | number | string
  reason?: string
  state?: SemanticState
  evidence?: Evidence[]
  revisions?: Revision[]
  source?: { label: string, ref: string } // lineage (PC11)
  correlationId?: string
}

export interface DecisionOption { value: string, label: string, tone: 'approve' | 'reject' | 'neutral', reasonRequired: boolean, effect: string }
export interface DecisionContext { document: string, company: string, options: DecisionOption[], evidence?: Evidence[], impacts?: Impact[] }

export interface CorrectionField { key: string, label: string, unit?: string, original: string, kind: 'number' | 'text' }

export interface Approver { name: string, role: string, onBehalfOf?: string }
export interface Delegation { delegator: string, delegate: string, from: Date | number, to: Date | number, scope: string }

export interface FeatureAvailability {
  feature: string
  enabled: boolean
  reason?: string
  setting?: { key: string, scope: 'system' | 'tenant' | 'company', to?: string }
}

export const READINESS_STATE: Record<ReadinessResult, SemanticState> // ready→data.ready, blocked→work.blocked, incomplete→data.partial, unknown→data.no_data
export const ACTIVITY_STATE: Partial<Record<ActivityKind, SemanticState>> // approved→work.completed, rejected→history.rejected, corrected→history.corrected, reopened→history.reopened, reversed→history.invalidated, submitted→work.pending_review, returned→work.pending, delegated→work.assigned
```

`Impact` is the existing type from `components/aapm/erp/types.ts`, re-exported from `contracts`.

## Components (`src/components/aapm/work/`)

| Component                | Interface                                                                                                         | Behaviour                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ReasonedAction.vue`     | `availability: ActionAvailability`, `variant?`, `size?`; slot = label; emits `activate`                           | A Button wrapper. When `disabled`, it uses `aria-disabled="true"` (not `disabled`), so it stays focusable and hoverable. It blocks activation and shows the reason in a Tooltip (on hover and on focus), plus a visually hidden `aria-describedby` text. `loading` shows a spinner and keeps its width. `done` renders a check with the `note`. Business rules never live here.                                                                                |
| `BlockerList.vue`        | `blockers: Blocker[]`; emits `open(source)`                                                                       | An ordered list. Each blocker shows its title, reason, resolution hint and an optional source link/button. An empty list renders nothing.                                                                                                                                                                                                                                                                                                                      |
| `ReadinessReview.vue`    | `readiness: Readiness`; emits `open`, `next`                                                                      | Shows the subject; the result as a `StateChip` (via `READINESS_STATE`) plus the text "Siap" / "Terblokir (2)" / "Belum lengkap" / "Tidak diketahui"; `evaluatedAt` through `FreshnessIndicator`-style relative time; `BlockerList`; a collapsible "Syarat terpenuhi (n)"; and `next` as a `ReasonedAction`, available only when the result is `ready`.                                                                                                         |
| `KeyValueList.vue`       | `items: { key: string, value: string, unit?: string, hint?: string }[]`, `columns?: 1 \| 2 \| 3`                  | A `dl` grid using `minmax(0,1fr)` and `overflow-wrap:anywhere`. Units are kept. Numbers use tabular figures. An empty value shows "—".                                                                                                                                                                                                                                                                                                                         |
| `RevisionDiff.vue`       | `revisions: Revision[]`                                                                                           | Each field shows its label, then before (struck through, danger tint) → after (success tint), then reason, actor and time (`formatRelativeId` plus an absolute WIB tooltip), evidence links, and an optional state change (StateChip → StateChip). It is read-only and never shows edit controls.                                                                                                                                                              |
| `ActivityFeed.vue`       | `entries: ActivityEntry[]`, `terminal?: string`, `filter?: ActivityKind[]`                                        | An immutable timeline in an `ol` with `aria-label`. Each entry shows actor, role, kind label, reason, `StateChip` (from `state ?? ACTIVITY_STATE[kind]`), evidence, inline `RevisionDiff` when revisions exist, and source / correlation ID (PC11). There are no edit or delete controls. `ApprovalTimeline` becomes a thin preset over it.                                                                                                                    |
| `RelatedObjects.vue`     | `items: { label: string, ref: string, state?: SemanticState, to?: string, meta?: string }[]`                      | A wrapping list of cards (`auto-fill`, `minmax(min(100%,15rem),1fr)`). Each card shows label, ref, StateChip and link. An empty list says "Belum ada dokumen terkait".                                                                                                                                                                                                                                                                                         |
| `Entity360.vue`          | slots `summary`, `activity`, `related`, `documents`; props `title`, `subtitle`, `state?`                          | A header (title, subtitle, StateChip) plus a `KeyValueList` summary slot, and Tabs for Aktivitas, Terkait and Dokumen. Each slot shows its own empty state.                                                                                                                                                                                                                                                                                                    |
| `DecisionForm.vue`       | `context: DecisionContext`; emits `submit({ value, reason })` → Promise                                           | Options are radio cards (the B1 radio-cards motion). The reason textarea is required whenever the chosen option says so (inline error plus focus). Evidence and `ImpactPreview` are shown. A confirmation dialog names the document, company and effect. While submitting, the form is disabled and cannot be submitted twice. A rejected promise or a timeout shows "Hasil belum pasti" with "Cek status" / "Coba lagi"; it never invites a duplicate submit. |
| `CorrectionForm.vue`     | `fields: CorrectionField[]`, `reasonRequired?: true`; emits `preview(revisions)`, `submit({ revisions, reason })` | For each field it shows the original value read-only next to the corrected input, with the unit. Only changed fields become `Revision[]`. A live `RevisionDiff` preview sits below. Submit is unavailable (via `ReasonedAction`) until at least one field changes and a reason is given. Number parsing follows `id-ID`, and an ambiguous value is rejected.                                                                                                   |
| `ProgressLog.vue`        | `entries: ActivityEntry[]` (kind `progress`); emits `append({ note, value? })`                                    | Append-only: earlier entries are never editable. A mistake is corrected by appending an entry that references the earlier one, which renders it as "Koreksi atas …". The new-entry composer sits at the bottom.                                                                                                                                                                                                                                                |
| `ApprovalDelegation.vue` | `approvers: Approver[]`, `delegations?: Delegation[]`                                                             | Shows the effective approver chain. A delegation shows as "atas nama …" with its validity window. When `approvers` is empty, it renders a `ReadinessReview`-style blocker: "Tidak ada approver yang berwenang", with a resolution hint.                                                                                                                                                                                                                        |
| `FeatureGate.vue`        | `availability: FeatureAvailability`; default slot = the gated control                                             | When enabled, it renders the slot unchanged. When disabled, it renders the slot's action through `ReasonedAction` semantics (the reason plus a "Buka pengaturan" link to `setting.to` and its scope label: Sistem / Tenant / Perusahaan). It never guesses a default.                                                                                                                                                                                          |

## End-to-end flow: "Koreksi penerimaan barang" (`/ui-kit` tab "ERP", section `id="alur-koreksi"`)

The demo state machine lives in `src/pages/ui-kit/components/kit-correction-flow.vue` and uses local refs only.

1. **Document.** `DocumentHeader` for GRN-2611-0086, status `posted`, with a `KeyValueList` summary.
2. **Readiness.** `ReadinessReview` subject "Koreksi GRN-2611-0086" → `blocked`. The blockers are "Periode November masih terbuka" (✓ satisfied), "Faktur pembelian PI-2611-031 sudah memakai baris 2" (resolution: "Batalkan tautan faktur", with a button) and "Stok lot KL-2611-11 sudah keluar 200 kg" (informational, non-blocking, shown under satisfied). Pressing "Batalkan tautan faktur" re-evaluates: the demo sets the result to `ready`.
3. **Action.** "Buka koreksi" is a `ReasonedAction` that stays disabled, with the first blocker's reason, until the result is `ready`.
4. **Correction.** `CorrectionForm` holds the line-2 quantity (1.200 kg) and lot. The user changes the quantity to 1.250,5 kg and types a reason. The `RevisionDiff` preview updates live. Submitting moves the document chip to `work.pending_review`.
5. **Decision.** `DecisionForm` (Setujui / Kembalikan / Tolak; reason required for Kembalikan and Tolak) goes through the confirmation dialog. Approving runs a 900 ms simulated save, then the chip moves to `history.corrected`.
6. **Result.** `ActivityFeed` gains the entries Mengajukan koreksi → Menyetujui → Dikoreksi, carrying the revisions inline, a source `GRN-2611-0086` and a correlation ID. `RelatedObjects` lists PI-2611-031 (`history.withdrawn` link) and the stock journal. A "Mulai ulang" button resets the demo.

Every step is keyboard-operable, and the flow works at 375 px.

## Other demos

`/ui-kit` gets a new tab **"Siklus & keputusan"** (`kit-lifecycle.vue`), with one section per component:

| Section anchor   | Demos                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `kesiapan`       | ReadinessReview in all 4 results, plus a PC05 onboarding example: "Perusahaan siap posting" with blockers COA, opening period, master gudang |
| `aksi-beralasan` | ReasonedAction in its 4 states, plus a row-action table example                                                                              |
| `keputusan`      | DecisionForm                                                                                                                                 |
| `koreksi`        | CorrectionForm                                                                                                                               |
| `progres`        | ProgressLog                                                                                                                                  |
| `revisi`         | RevisionDiff                                                                                                                                 |
| `aktivitas`      | ActivityFeed, with lineage                                                                                                                   |
| `ringkasan`      | KeyValueList                                                                                                                                 |
| `terkait`        | RelatedObjects                                                                                                                               |
| `entitas-360`    | Entity360 (a supplier: CV Minang Pangan)                                                                                                     |
| `delegasi`       | ApprovalDelegation, including no approver and active delegation                                                                              |
| `fitur`          | FeatureGate, including disabled with setting scope                                                                                           |

The section `alur-koreksi` stays in the ERP tab. All anchors are added to `kit-anchors.ts`.

## Registry updates

The 14 rows move to `ada`, with `components` and `demo` filled in. A row whose server-side half is out of the template's reach stays `sebagian`, with a note, e.g. PC11 "korelasi lintas layanan milik backend". UI-DAT-017 and UI-DAT-010 update from their B1 `sebagian` notes. `pnpm capabilities:doc` is regenerated.

## Testing

- **Contracts:** every `ReadinessResult` and every mapped `ActivityKind` resolves to an existing `SemanticState`.
- **ReasonedAction:**
  - disabled stays focusable (`tabindex` not -1, no `disabled` attribute), sets `aria-disabled="true"` and exposes the reason through `aria-describedby`;
  - click and Enter do not emit `activate`;
  - `loading` keeps the button's width (style min-width set from the measured width) and blocks activation;
  - `done` shows its note.
- **BlockerList / ReadinessReview:**
  - blocker order is preserved;
  - the result text is shown;
  - `next` is available only when the result is `ready`;
  - an empty blocker list hides the list.
- **DecisionForm:**
  - reason is required per option, with an inline error and focus;
  - the confirmation names the document and company;
  - a second submit during a pending submit is ignored;
  - a rejected promise shows "Hasil belum pasti" with "Cek status".
- **CorrectionForm:**
  - unchanged fields produce no revision;
  - `1.250,5` parses to 1250.5 and renders `1.250,5 kg`;
  - an ambiguous `1.2.3` is rejected;
  - submit is unavailable until there is a change and a reason.
- **ActivityFeed / RevisionDiff / ProgressLog:**
  - there are no edit controls;
  - revisions render before → after with units;
  - an appended correction references the earlier entry, and earlier entries are unchanged.
- **ApprovalDelegation:** an empty approvers list renders the "Tidak ada approver yang berwenang" blocker; a delegation shows "atas nama".
- **FeatureGate:** disabled renders the reason and a settings link with its scope; enabled renders the slot unchanged.
- **Flow (`kit-correction-flow`):** a scripted test drives readiness → resolve → open correction → change + reason → submit → approve (with fake timers). It asserts the final chip `history.corrected` and three new activity entries.
- **Compatibility:** the existing ApprovalTimeline and AuditDrawer usages render the same text as before.
- **Registry:** the 14 rows are `ada` or `sebagian` with real anchors (the B1 tests already enforce this).
- **Manual:**
  - `/ui-kit` "Siklus & keputusan" and "Alur koreksi" at 375 and 1280, light and dark;
  - layout auditor with 0 blockers and 0 majors;
  - keyboard-only walkthrough of the flow.

## Non-goals

- Real persistence, server re-evaluation, permission checks, idempotency keys or a real approval engine. The demo simulates them.
- Navigation and context patterns (B2a), and data, metrics and report patterns (B2c).
- Enterprise grid (B4).
- Changes to `components/ui`.
