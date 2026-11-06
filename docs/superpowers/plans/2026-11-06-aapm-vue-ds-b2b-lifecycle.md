# AAPM UI (Vue) B2b Decisions & Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Typed lifecycle contracts, 13 leaf and recipe components covering readiness, reasoned actions, decision, correction, progress, revision, activity, record summary, related objects, Entity 360, delegation and feature gate, plus one end-to-end "Koreksi penerimaan barang" flow.

**Architecture:**

- **Contracts:** live in `src/design-system/contracts/lifecycle.ts`. They are types plus two state mappers onto the B1 vocabulary.
- **Components:** live in `src/components/aapm/work/`. They render data and emit intents, and never decide business state.
- **Demos:** a new `/ui-kit` tab "Siklus & keputusan", and an `alur-koreksi` section in the ERP tab whose demo-only state machine lives in `src/pages/ui-kit/components/`.

**Tech Stack:** Vue 3.5, TypeScript 6, shadcn-vue (stock), Reka, Tailwind 4, vitest + happy-dom. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-06-aapm-vue-ds-b2b-lifecycle-design.md`. It holds the contract shapes, the component table, the flow steps, the demo anchors and the test list. Read it first.

## Global Constraints

- `src/components/ui/**` stays stock. Colours come only through tokens, semantic states and tones. Never write literal brand hex.
- No business logic in components. Readiness, blockers, eligibility, approvers and settings are inputs. Components emit intents only.
- The B1 boundary guard applies to `src/design-system/**` and `src/components/aapm/**`. They must never import `@/pages`, `@/stores`, `@/router`, `@/services` or `@/layouts`.
- `ApprovalTimeline` (`events`, `terminal`) and `AuditDrawer` keep their props and rendered text. `TimelineEvent` stays exported.
- Copy is in Bahasa Indonesia, in light and dark, with text ≥ 4.5:1 and colour never the only signal. Respect reduced motion.
- **Commands:**
  - Run scripts as `npx -y pnpm@11.28.8 <script>`.
  - After `lint:fix`, run `git checkout -- .github/copilot-instructions.md`.
  - If tests hit an `UNKNOWN … auto-import.d.ts` error, rerun them.
- **Branch:** work on `feat/aapm-b2b-lifecycle`, cut from `origin/main` (837d582). Commit only when the user asks, and commit in batches of 40 files or fewer, because the pre-commit command line overflows on Windows.

## Review Focus

1. **Keyboard on a disabled ReasonedAction.** With the reasoned action focused, Enter and Space do nothing, and the reason is announced and visible on focus without a mouse. Test in Task 2: `keyboard cannot activate a disabled action and focus reveals the reason`.
2. **Indonesian number input.** `1.250` means 1250 (a thousands separator), `1.250,5` means 1250.5, `1250,5` means 1250.5, and ambiguous strings such as `1.2.3` or `1,250.5` are rejected. Nothing silently changes magnitude. Test in Task 7: `parses id-ID numbers and rejects ambiguous ones`.
3. **Double-submit in DecisionForm.** Rapid double-click on confirm, Enter pressed twice, or Esc in the confirm dialog: exactly one submit, or none after Esc, and focus returns to the trigger. Test in Task 6: `double confirm submits once; Esc cancels and restores focus`.
4. **Empty inputs.** `ActivityFeed`, `RelatedObjects`, `KeyValueList` and `BlockerList` with `[]` render an informative empty state (or nothing, for BlockerList), never a bare frame. Tests in Tasks 4 and 5: `empty … renders its empty state`.
5. **Long labels at 320 px.** 120-character blocker titles, field labels and actor names wrap without page-level horizontal scroll. Covered in Task 11 Step 3: run the auditor with `--stress longword` at 320, and expect 0 blockers or majors.

---

### Task 1: Lifecycle contracts

**Files:**

- Create: `src/design-system/contracts/lifecycle.ts`
- Create: `src/design-system/contracts/index.ts` (barrel; re-exports `Impact` from `@/components/aapm/erp/types`)
- Test: `src/design-system/contracts/__tests__/lifecycle.test.ts`

**Interfaces — Produces:**

- Every type in the spec's "Contracts" block, with the exact names: `ReadinessResult`, `ActionRef`, `Blocker`, `Readiness`, `ActionAvailability`, `Evidence`, `Revision`, `ActivityKind`, `ActivityEntry`, `DecisionOption`, `DecisionContext`, `CorrectionField`, `Approver`, `Delegation`, `FeatureAvailability`.
- `READINESS_STATE: Record<ReadinessResult, SemanticState>` and `ACTIVITY_STATE: Partial<Record<ActivityKind, SemanticState>>`, with the values from the spec.
- `READINESS_LABEL: Record<ReadinessResult, string>` = `{ ready: 'Siap', blocked: 'Terblokir', incomplete: 'Belum lengkap', unknown: 'Tidak diketahui' }`.
- `ACTIVITY_LABEL: Record<ActivityKind, string>`, with Indonesian verbs for every kind.

- [ ] **Step 1: Write the failing tests.**

  ```ts
  it('every readiness result maps to a real semantic state', () => {
    for (const r of ['ready', 'blocked', 'incomplete', 'unknown'] as const)
      expect(isSemanticState(READINESS_STATE[r])).toBe(true)
  })
  it('maps results per spec', () => expect(READINESS_STATE).toEqual({ ready: 'data.ready', blocked: 'work.blocked', incomplete: 'data.partial', unknown: 'data.no_data' }))
  it('every mapped activity kind is a semantic state', () => {
    for (const s of Object.values(ACTIVITY_STATE))
      expect(isSemanticState(s!)).toBe(true)
  })
  it('labels every activity kind', () => expect(Object.keys(ACTIVITY_LABEL).sort()).toEqual(['approved', 'commented', 'corrected', 'created', 'delegated', 'posted', 'progress', 'reopened', 'rejected', 'returned', 'reversed', 'submitted']))
  ```

- [ ] **Step 2:** Run `test:run src/design-system/contracts`. Expected: FAIL (module missing).
- [ ] **Step 3:** Implement `lifecycle.ts`. Keep `TimelineEvent` in `erp/types.ts` and add a test-only assignability check: `const _: ActivityEntry = {} as TimelineEvent & { kind: ActivityKind }` (type-level only).
- [ ] **Step 4:** Run the tests. Expected: PASS.

### Task 2: ReasonedAction

**Files:**

- Create: `src/components/aapm/work/ReasonedAction.vue`
- Test: `src/components/aapm/work/__tests__/reasoned-action.test.ts`

**Interfaces:**

- **Consumes:** `ActionAvailability`; `Button` and `Tooltip*` from `@/components/ui`.
- **Produces:** `<ReasonedAction :availability variant? size?>label</ReasonedAction>`, which emits `activate`.

- [ ] **Step 1: Write the failing tests.**
  - `disabled stays focusable and explains itself`: the button has no `disabled` attribute, `aria-disabled="true"`, and `tabindex` is not `-1`. The element at `aria-describedby` contains the reason text.
  - `keyboard cannot activate a disabled action and focus reveals the reason`: `trigger('click')`, `keydown.enter` and `keydown.space` give no `activate`. After `trigger('focus')`, the tooltip content containing the reason is rendered (`attachTo: document.body`).
  - `loading blocks activation and keeps its width`: the spinner is present, a click gives no `activate`, and `style.minWidth` is set.
  - `done shows its note` and `available emits activate once per click`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Disabled: intercept `click` and `keydown` (Enter and Space) with `preventDefault`. Use `aria-disabled`, never the `disabled` attribute.
  - Use a Tooltip whose `open` follows hover and focus.
  - Add a visually hidden `<span :id>` holding the reason.
  - Loading: measure the width once on entering the loading state, then set `minWidth`.
- [ ] **Step 4:** Run the tests. Expected: PASS.

### Task 3: BlockerList and ReadinessReview

**Files:**

- Create: `src/components/aapm/work/BlockerList.vue`, `src/components/aapm/work/ReadinessReview.vue`
- Test: `src/components/aapm/work/__tests__/readiness.test.ts`

**Interfaces:**

- **Consumes:** `Readiness`, `Blocker`, `READINESS_STATE`, `READINESS_LABEL` (Task 1); `StateChip` (B1); `ReasonedAction` (Task 2); `formatRelativeId` (B1).
- **Produces:**
  - `<BlockerList :blockers @open>`.
  - `<ReadinessReview :readiness @open @next>`. The header text reads `READINESS_LABEL[result]`, plus ` (n)` when blocked.

- [ ] **Step 1: Write the failing tests.**
  - `keeps the consumer's blocker order`.
  - `shows the result as text, not colour only`: the text contains `Terblokir (2)`, and the StateChip has `data-semantic-state="work.blocked"`.
  - `next is available only when ready`: when blocked, the ReasonedAction has `aria-disabled` and the reason is the first blocker's title; when ready, a click emits `next`.
  - `empty blockers renders no list`.
  - `satisfied conditions collapse under "Syarat terpenuhi (n)"`.
  - `open emits the blocker's source`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement. Use `<ol>` for the blockers, and the `Collapsible` from `@/components/ui` for the satisfied conditions.
- [ ] **Step 4:** Run the tests. Expected: PASS.

### Task 4: KeyValueList, RelatedObjects and Entity360

**Files:**

- Create: `src/components/aapm/work/KeyValueList.vue`, `RelatedObjects.vue`, `Entity360.vue`
- Test: `src/components/aapm/work/__tests__/record.test.ts`

**Interfaces — Produces:** the props and slots in the spec table.

- [ ] **Step 1: Write the failing tests.**
  - `key-value keeps units and dashes empty values`: `{ key: 'Berat', value: '1.250,5', unit: 'kg' }` renders the text `1.250,5 kg`, and `value: ''` renders `—`. The output is a `dl` with `dt` and `dd`.
  - `empty key-value list renders its empty state`: the text is `Belum ada data`.
  - `related objects link and show state`: there is an `a[href]` and a StateChip.
  - `empty related objects renders its empty state`: the text is `Belum ada dokumen terkait`.
  - `entity 360 renders summary and tabs with per-slot empty states`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Grids use `minmax(0,1fr)` / `minmax(min(100%,15rem),1fr)`.
  - Values use `overflow-wrap:anywhere` and the `numeric` utility.
  - Entity360 uses `Tabs` from `@/components/ui`.
- [ ] **Step 4:** Run the tests. Expected: PASS.

### Task 5: RevisionDiff, ActivityFeed and the ApprovalTimeline preset

**Files:**

- Create: `src/components/aapm/work/RevisionDiff.vue`, `ActivityFeed.vue`
- Modify: `src/components/aapm/erp/approval-timeline.vue` (becomes a preset over ActivityFeed), `src/components/aapm/erp/audit-drawer.vue` (renders RevisionDiff)
- Test: `src/components/aapm/work/__tests__/history.test.ts`, plus extend the existing erp tests if any

**Interfaces:**

- **Consumes:** `Revision`, `ActivityEntry`, `ACTIVITY_STATE`, `ACTIVITY_LABEL`.
- **Produces:** `<RevisionDiff :revisions>` and `<ActivityFeed :entries terminal? filter?>`.

- [ ] **Step 1: Write the failing tests.**
  - `revision shows before → after with units, reason, actor`: `del` holds `1.200 kg`, `ins` holds `1.250,5 kg`, and the reason and actor are present.
  - `state change renders two chips`.
  - `activity feed is read-only`: it contains no `button`, `input` or `[contenteditable]` except evidence links.
  - `lineage shows source and correlation id`.
  - `inline revisions render inside an entry`.
  - `empty activity feed renders its empty state`: the text is `Belum ada aktivitas`.
  - `approval timeline keeps its rendered text`: mount `ApprovalTimeline` with the kit-erp fixture events, and the text includes "Menyetujui" and the terminal label, unchanged from before. Snapshot the text taken from `git show HEAD:` before the change.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Times use `formatRelativeId` plus a `title` with the absolute WIB time (`toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })`).
  - The ApprovalTimeline maps `TimelineEvent` to `ActivityEntry` (`action` becomes `kind`).
- [ ] **Step 4:** Run the tests and the B1 suites (`test:run src/components/aapm src/design-system`). Expected: PASS.

### Task 6: DecisionForm

**Files:**

- Create: `src/components/aapm/work/DecisionForm.vue`
- Test: `src/components/aapm/work/__tests__/decision.test.ts`

**Interfaces:**

- **Consumes:** `DecisionContext`, `ImpactPreview` (erp), radio-cards motion (`data-aapm-radio-cards`), `AlertDialog` from `@/components/ui`.
- **Produces:** `<DecisionForm :context :submit="(d: { value: string, reason: string }) => Promise<void>">`. The submit is a prop function, so the component can await it.

- [ ] **Step 1: Write the failing tests.**
  - `reason required per option`: choose "Tolak" with an empty reason and confirm. An inline `field-error` appears, focus moves to the textarea, and submit is not called.
  - `confirmation names document, company and effect`.
  - `double confirm submits once; Esc cancels and restores focus`: clicking confirm twice calls submit once; Esc on the dialog calls submit 0 times, and `document.activeElement` is the trigger.
  - `rejected submit shows outcome unknown`: the text is `Hasil belum pasti`, and the buttons are `Cek status` and `Coba lagi`. Retry reuses the same payload.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3: Implement.** Keep a pending flag. Wire the blocked submit into the B1 `useBlockedFeedback` so the form shakes on a missing reason.
- [ ] **Step 4:** Run the tests. Expected: PASS.

### Task 7: CorrectionForm and id-ID number parsing

**Files:**

- Create: `src/components/aapm/work/CorrectionForm.vue`
- Modify: `src/lib/format-id.ts` (add `parseNumberId`)
- Test: `src/lib/__tests__/format-id.test.ts` (extend), `src/components/aapm/work/__tests__/correction.test.ts`

**Interfaces — Produces:**

- `parseNumberId(input: string): number | null`. It accepts `.` as a thousands separator only in groups of 3, and `,` as the decimal separator; anything else returns `null`.
- `<CorrectionForm :fields reason-required? @preview @submit>`.

- [ ] **Step 1: Write the failing tests.**
  - `parses id-ID numbers and rejects ambiguous ones`:
    - `1.250` → 1250; `1.250,5` → 1250.5; `1250,5` → 1250.5; `12` → 12.
    - `1.2.3` → null; `1,250.5` → null; `1.25` → null; `''` → null.
  - `unchanged fields produce no revision`.
  - `a changed number becomes a revision with units`: changing `1.200` to `1.250,5` emits `preview` with `[{ field: 'Kuantitas baris 2', before: '1.200 kg', after: '1.250,5 kg' }]`.
  - `ambiguous input shows an inline error and no revision`.
  - `submit unavailable until a change and a reason`: the ReasonedAction is disabled, and its reason reads `Ubah minimal satu nilai` until a change is made, then `Isi alasan koreksi` until a reason is given.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement. Show the original value read-only next to the input, and render the live `RevisionDiff` preview.
- [ ] **Step 4:** Run the tests. Expected: PASS.

### Task 8: ProgressLog, ApprovalDelegation and FeatureGate

**Files:**

- Create: `src/components/aapm/work/ProgressLog.vue`, `ApprovalDelegation.vue`, `FeatureGate.vue`
- Test: `src/components/aapm/work/__tests__/governance.test.ts`

**Interfaces:**

- **Consumes:** `ActivityEntry`, `Approver`, `Delegation`, `FeatureAvailability`, `ReasonedAction`, `ReadinessReview`.
- **Produces:**
  - `<ProgressLog :entries @append>`, where `append` carries `{ note: string, value?: string, corrects?: string }`.
  - `<ApprovalDelegation :approvers :delegations?>`.
  - `<FeatureGate :availability>` with a default slot.

- [ ] **Step 1: Write the failing tests.**
  - `progress log never edits earlier entries`: earlier entries have no input; appending `corrects: 'p1'` renders `Koreksi atas` and references `p1`.
  - `no approver renders the authority blocker`: the text is `Tidak ada approver yang berwenang`.
  - `delegation shows "atas nama" and its window`.
  - `feature gate disabled shows reason, settings link and scope`: the text includes the reason, `Perusahaan`, and an `a[href]` pointing at `setting.to`.
  - `feature gate enabled renders the slot unchanged`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests. Expected: PASS.

### Task 9: "Siklus & keputusan" tab

**Files:**

- Create: `src/pages/ui-kit/components/kit-lifecycle.vue`
- Modify: `src/pages/ui-kit/index.vue` (add a tab `{ value: 'siklus', label: 'Siklus & keputusan' }`), `src/pages/ui-kit/components/kit-anchors.ts` (add `siklus` to `KIT_TABS` and `KIT_TAB_FILES`, plus the 12 anchors from the spec)
- Test: `src/pages/ui-kit/components/__tests__/kit-lifecycle.test.ts`

- [ ] **Step 1: Write the failing test.** `every lifecycle anchor renders and maps to the siklus tab`: mount `KitLifecycle` and check that every `id` in the spec list (`kesiapan`, `aksi-beralasan`, `keputusan`, `koreksi`, `progres`, `revisi`, `aktivitas`, `ringkasan`, `terkait`, `entitas-360`, `delegasi`, `fitur`) exists, and that `KIT_ANCHOR_TAB[id] === 'siklus'`.
- [ ] **Step 2:** Run the test. Expected: FAIL.
- [ ] **Step 3: Implement the demo sections** with farm sample data, as the spec's "Other demos" lists:
  - the PC05 onboarding readiness;
  - ReasonedAction in all 4 states plus a row-action table;
  - the "CV Minang Pangan" Entity360.
- [ ] **Step 4:** Run the test and `test:run src/design-system` (the anchor-map test). Expected: PASS.

### Task 10: End-to-end flow "Koreksi penerimaan barang"

**Files:**

- Create: `src/pages/ui-kit/components/kit-correction-flow.vue`
- Modify: `src/pages/ui-kit/components/kit-erp.vue` (render it as section `id="alur-koreksi"`), `kit-anchors.ts` (map `alur-koreksi` → `erp`)
- Test: `src/pages/ui-kit/components/__tests__/kit-correction-flow.test.ts`

- [ ] **Step 1: Write the failing test** `walks readiness → correction → approval to a corrected document` (with fake timers):
  - the initial chip is `work.completed` (posted);
  - "Buka koreksi" is disabled with the reason "Faktur pembelian PI-2611-031 sudah memakai baris 2";
  - after clicking "Batalkan tautan faktur", "Buka koreksi" is available;
  - open it, set the quantity to `1.250,5`, set the reason, and submit; the chip is now `work.pending_review`;
  - choose "Setujui", confirm, and advance 900 ms; the chip is now `history.corrected`;
  - the activity feed gains 3 entries ("Mengajukan koreksi", "Menyetujui", "Dikoreksi"), and the last one carries the inline revision `1.200 kg` → `1.250,5 kg`;
  - "Mulai ulang" restores the initial state.
- [ ] **Step 2:** Run the test. Expected: FAIL.
- [ ] **Step 3:** Implement the flow as a demo-only state machine with refs, following the spec's steps 1–6.
- [ ] **Step 4:** Run the test. Expected: PASS.

### Task 11: Registry, docs and verification

**Files:**

- Modify: `src/design-system/capabilities.ts` (the 14 rows from the spec's scope table), `docs/design-system/CAPABILITY_MATRIX.md` (regenerated), `docs/design-system/README.md` (a short "Lifecycle patterns" section)
- Test: `src/design-system/__tests__/capabilities.test.ts` (extend)

- [ ] **Step 1: Write the failing test.** `B2b rows are delivered`: each of `UI-WRK-READINESS`, `UI-FRM-008`, `UI-FRM-007`, `UI-FRM-011`, `UI-FRM-010`, `UI-DAT-010`, `UI-DAT-017`, `UI-DAT-007`, `UI-DAT-011`, `UI-DAT-012`, `PC05`, `PC09`, `PC11` and `PC17` has status `ada` or `sebagian`. Every `ada` row lists at least one `src/components/aapm/work/` file. PC11 is `sebagian` and its note mentions backend correlation.
- [ ] **Step 2:** Run the test. Expected: FAIL. Then update the registry and run `capabilities:doc`. Expected: PASS.
- [ ] **Step 3: Verify.**
  - Run `lint:fix` (restoring the symlink), the full `test:run`, `vue-tsc --noEmit -p tsconfig.app.json` and `build`. Expected: all green.
  - Run the layout auditor on `/ui-kit#kesiapan` and `/ui-kit#alur-koreksi` at 320/375/1280, light and dark, with `--stress longword`. Expected: 0 blockers and 0 majors, with any false positive explained.
  - Do a keyboard-only walkthrough of the flow with the browser pane visible.
