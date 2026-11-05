# AAPM UI (Vue) B1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the AAPM Vue template a governed foundation: Ecosystem-sourced brand tokens, the Ecosystem state vocabulary as semantic status, an 83-row capability matrix, and a package-ready import boundary.

**Architecture:**

- A vendored copy of the Ecosystem DTCG file feeds a generator. The generator writes `brand.generated.css`, and `primitives.css` consumes that file.
- `src/design-system/` holds non-visual contracts: the brand JSON, the state vocabulary and the capability registry.
- Business values resolve to semantic states, and semantic states resolve to tones. Overrides keep every chip's current colour.
- Guards are vitest tests that read the source tree.

**Tech Stack:** Vue 3.5, TypeScript 6, Tailwind 4, vitest + happy-dom, and Node 22 (`--experimental-strip-types` for TS scripts). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-05-aapm-vue-ds-b1-foundation-design.md`. Read it first. Its tables (vocabulary, business mapping, region mapping, routing, generated variable names) are the values this plan refers to.

## Global Constraints

- `src/components/ui/**` stays stock. shadcn token names and their neutral values stay intact.
- Brand Core values never change. Derived ramps stay local.
- No chip changes colour: `toneOf()` returns today's tone for every existing value.
- Copy is in Bahasa Indonesia. Light and dark. Text ≥ 4.5:1. Colour is never the only signal.
- No new dependencies and no ESLint plugin additions.
- Commands: `npx -y pnpm@11.28.8 <script>`.
  - After `lint:fix`, restore the symlink with `git checkout -- .github/copilot-instructions.md`.
  - If a vitest run fails with `UNKNOWN … auto-import.d.ts`, rerun it.
- No commits unless the user asks.

## Review Focus

1. **Nested tokens:** the Ecosystem adds a token or a deeper group (e.g. `semantic.status.success`). Sync must emit it with no code change. Test in Task 1: `emits nested groups at any depth`.
2. **Bad sync path:** `tokens:sync --from` points at a wrong path. The command exits non-zero, prints the missing path, and leaves the existing generated CSS untouched. Test in Task 1: `a bad --from path fails without touching the generated file`.
3. **Freshness time edge cases:** `since` is in the future (clock skew), missing, or under a minute old. The indicator reads "Diperbarui baru saja", never "dalam 2 menit" and never "Invalid Date". Test in Task 4: `relative time never reads as the future`.
4. **Unknown semantic state:** a StateChip receives a state the vocabulary doesn't know (an API drift string cast through `as`). It renders a neutral chip labelled with the raw value, never blank and never a crash. Test in Task 4: `unknown state renders a neutral chip with the raw text`.
5. **Narrow screens:** the 83-row matrix and long state labels at 320–375 px wrap without page-level horizontal scroll. Covered in Task 6 Step 4: `scrollWidth === innerWidth` at 375 on the Kapabilitas tab.

---

### Task 1: Brand source and token sync

**Files:**

- Create: `src/design-system/brand/aapm-brand.tokens.json` (copy of `D:/SA/AAPM_Ecosystem/docs/design-system/brand/tokens/aapm-brand.tokens.json`)
- Create: `src/design-system/brand/SOURCE.md`
- Create: `scripts/sync-brand-tokens.mjs`
- Create: `src/assets/tokens/brand.generated.css`
- Modify: `src/assets/index.css` (import the generated file before `primitives.css`), `src/assets/tokens/primitives.css` (lines 14–43: master values become `var(--aapm-brand-…)`), `src/constants/themes.ts:9` and `src/pages/brand/components/brand-board.vue:8-11` (read hex from the vendored JSON), `package.json` (script `"tokens:sync": "node scripts/sync-brand-tokens.mjs"`)
- Test: `src/assets/tokens/__tests__/brand-tokens.test.ts`

**Interfaces — Produces:**

- `renderBrandCss(tokens: object): string`, exported from `scripts/sync-brand-tokens.mjs`. It throws `Error('unresolved reference {…}')` and `Error('non-colour token <path>')`.
- The script's CLI is `node scripts/sync-brand-tokens.mjs [--from <ecosystem-root>]`. It writes only after a successful render.
- Variables named as in the spec's "Generated CSS variables" table.

- [ ] **Step 1: Write the failing tests** in `brand-tokens.test.ts` (node environment):

```ts
it('emits every brand value', () => {
  expect(css).toContain('--aapm-brand-core-green: #318139;')
  expect(css).toContain('--aapm-brand-digital-ink: #10191A;')
})
it('resolves semantic aliases to var() references', () => {
  expect(css).toContain('--aapm-brand-semantic-brand-primary: var(--aapm-brand-core-green);')
})
it('the generated file is current', () => {
  expect(readFileSync(GENERATED, 'utf8')).toBe(renderBrandCss(json))
})
it('emits nested groups at any depth', () => {
  expect(renderBrandCss({ semantic: { status: { success: { $type: 'color', $value: '#000000' } } } }))
    .toContain('--aapm-brand-semantic-status-success: #000000;')
})
it('rejects unresolved references and non-colour tokens', () => {
  expect(() => renderBrandCss({ a: { $type: 'color', $value: '{brand.nope}' } })).toThrow(/unresolved/)
  expect(() => renderBrandCss({ a: { $type: 'dimension', $value: '4px' } })).toThrow(/non-colour/)
})
it('a bad --from path fails without touching the generated file', () => {
  const before = readFileSync(GENERATED, 'utf8')
  const run = spawnSync(process.execPath, ['scripts/sync-brand-tokens.mjs', '--from', 'Z:/nope'], { encoding: 'utf8' })
  expect(run.status).not.toBe(0)
  expect(run.stderr).toContain('Z:/nope')
  expect(readFileSync(GENERATED, 'utf8')).toBe(before)
})
it('primitives take master values from the generated layer', () => {
  expect(primitives).toMatch(/--aapm-core-green:\s*var\(--aapm-brand-core-green\)/)
})
it('no brand master hex is written literally outside the allowed files', () => {
  // scan src/**/*.{css,vue,ts}; skip brand.generated.css, the vendored JSON, *.svg, __tests__;
  // strip /* */ and // comments; case-insensitive
  expect(offenders).toEqual([])
})
```

- [ ] **Step 2: Run the tests and check they fail.** Run `npx -y pnpm@11.28.8 test:run src/assets/tokens`. Expected: FAIL, because `sync-brand-tokens.mjs` doesn't exist.
- [ ] **Step 3: Implement the generator, the CLI, `SOURCE.md` and the migrations.**
  - The generator walks the JSON. It skips `$`-keys and `meta`/`notes`, and kebab-cases the path segments.
  - A `{a.b.c}` value becomes `var(--aapm-brand-a-b-c)` after checking that the target exists.
  - The output is `:root { … }` under a header comment: "Generated from src/design-system/brand/aapm-brand.tokens.json by `pnpm tokens:sync` — do not edit".
  - `SOURCE.md` records the source path, the Ecosystem commit `a75b57d`, and the rule "never edit by hand".
  - In `themes.ts` and `brand-board.vue`, import the JSON and use `brand.core.green.$value` (and the others).
- [ ] **Step 4: Run the tests and check they pass.** Run `npx -y pnpm@11.28.8 tokens:sync`, then `test:run src/assets/tokens`. Expected: 8 tests PASS.

### Task 2: Semantic state vocabulary

**Files:**

- Create: `src/design-system/states.ts`
- Modify: `src/components/aapm/icon/registry.ts`
  - Add to the `status` group: `noData: CircleSlashIcon`, `invalidated: CircleSlashIcon`, `incomplete: CircleDashedIcon`, `stale: ClockAlertIcon`, `hold: PauseIcon`, `inProgress: LoaderIcon`, `corrected: PencilLineIcon`, `decision: ScaleIcon`, `superseded: LayersIcon`.
- Modify: `src/plugins/motion/action-icons.module.ts`
  - Add `'pencil-line': 'edit'`. The coverage guard requires an animation for every imported glyph.
- Test: `src/design-system/__tests__/states.test.ts`

**Interfaces — Produces:**

- `STATE_FAMILIES = ['data', 'freshness', 'work', 'history'] as const`; `type StateFamily`.
- `type SemanticState`: a union of `'<family>.<state>'` string literals, 32 keys in total (spec vocabulary table).
- `interface StateMeta { family: StateFamily, state: string, tone: Tone, icon: IconName, label: string, extension?: true, rationale?: string }`.
- `SEMANTIC_STATES: Readonly<Record<SemanticState, StateMeta>>`.
- `stateMeta(state: SemanticState): StateMeta`.
- `isSemanticState(value: string): value is SemanticState`.
- Use type-only imports of `Tone` (`@/components/aapm/tone/tones`) and `IconName`, so no runtime import cycle forms.

**Icon names per state:**

| Family    | State → icon                                                                                                                                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| data      | loading→`loading` · ready→`success` · empty→`inbox` · no_data→`noData` · error→`danger` · retrying→`refresh` · partial→`incomplete`                                                                                                                                                                          |
| freshness | current→`success` · stale→`stale` · offline→`offline` · syncing→`refresh` · sync_failed→`danger`                                                                                                                                                                                                             |
| work      | unassigned→`incomplete` · assigned→`userCheck` · pending→`pending` · pending_review→`view` · pending_decision→`decision` · conditional→`checklist` · hold→`hold` · blocked→`ban` · exception→`warning` · delayed→`timer` · completed→`success` · terminal→`locked` · draft→`edit` · in_progress→`inProgress` |
| history   | corrected→`corrected` · superseded→`superseded` · reopened→`reopen` · withdrawn→`reverse` · rejected→`danger` · invalidated→`invalidated`                                                                                                                                                                    |

Tones and labels come from the spec table.

- [ ] **Step 1: Write the failing tests:**

```ts
const ECOSYSTEM = {
  data: ['loading', 'ready', 'empty', 'no_data', 'error', 'retrying', 'partial'],
  freshness: ['current', 'stale', 'offline', 'syncing', 'sync_failed'],
  work: ['unassigned', 'assigned', 'pending', 'pending_review', 'pending_decision', 'conditional', 'hold', 'blocked', 'exception', 'delayed', 'completed', 'terminal'],
  history: ['corrected', 'superseded', 'reopened', 'withdrawn', 'rejected', 'invalidated'],
}
it('contains exactly the 30 Ecosystem states plus the 2 flagged extensions', () => {
  const ext = Object.values(SEMANTIC_STATES).filter(m => m.extension)
  expect(ext.map(m => `${m.family}.${m.state}`).sort()).toEqual(['work.draft', 'work.in_progress'])
  expect(ext.every(m => m.rationale)).toBe(true)
  for (const [family, states] of Object.entries(ECOSYSTEM)) {
    for (const s of states) expect(isSemanticState(`${family}.${s}`)).toBe(true)
  }
  expect(Object.keys(SEMANTIC_STATES)).toHaveLength(32)
})
it('every state has a known tone, a registered icon and a label', () => {
  for (const m of Object.values(SEMANTIC_STATES)) {
    expect(TONES).toContain(m.tone)
    expect(m.icon in ICONS).toBe(true)
    expect(m.label.trim()).not.toBe('')
  }
})
it('keeps the spec tones', () => {
  expect(stateMeta('work.pending_decision').tone).toBe('pink')
  expect(stateMeta('freshness.syncing').tone).toBe('blue')
  expect(stateMeta('history.superseded').label).toBe('Digantikan')
})
```

- [ ] **Step 2: Run the tests and check they fail.** Run `test:run src/design-system`. Expected: FAIL, because the module is missing.
- [ ] **Step 3: Implement `states.ts` and the registry additions.**
- [ ] **Step 4: Run the tests and check they pass.** Run `test:run src/design-system src/components/aapm/icon src/assets`. Expected: PASS, with the icon coverage guard still green.

### Task 3: Business mapping through the vocabulary

**Files:**

- Modify: `src/components/aapm/tone/tones.ts`, `src/components/aapm/erp/types.ts`
- Test: `src/components/aapm/tone/__tests__/tones.test.ts` (extend), `src/components/aapm/erp/__tests__/region-semantic.test.ts`

**Interfaces:**

- **Consumes:** `SemanticState`, `stateMeta`, `isSemanticState` (Task 2).
- **Produces:**
  - `STATE_DOMAINS`: `{ doc, task, billing, order }`. Each value maps to `SemanticState | { state: SemanticState, tone: Tone }`, using the spec's business-mapping table.
  - `type StateDomain = keyof typeof STATE_DOMAINS`.
  - `semanticOf(domain: StateDomain, value: string | null | undefined): SemanticState | null`.
  - `TONE_MAP` keeps its keys and its `ToneDomain` type. The `doc`/`task`/`billing`/`order` entries are derived from `STATE_DOMAINS`, with the override when present, otherwise `stateMeta(state).tone`.
  - `toneOf()` keeps its signature.
  - `REGION_SEMANTIC: Record<RegionState, SemanticState | null>`, using the spec's region table.

- [ ] **Step 1: Write the failing tests:**

```ts
// Fixture = today's TONE_MAP, copied verbatim from the current tones.ts before editing.
const TODAY = { doc: { draft: 'neutral', submitted: 'blue', review: 'amber', verified: 'teal', posted: 'green', paid: 'green', rejected: 'red', reversed: 'violet', locked: 'neutral' }, task: { 'backlog': 'neutral', 'todo': 'blue', 'in progress': 'amber', 'done': 'green', 'canceled': 'red' }, billing: { paid: 'green', unpaid: 'amber', overdue: 'red', cancelled: 'neutral' }, order: { draft: 'neutral', shipped: 'blue', paid: 'green', due: 'amber' } /* …plus the categorical domains verbatim */ }
it('repaints no chip', () => {
  for (const [d, values] of Object.entries(TODAY)) {
    for (const [v, tone] of Object.entries(values)) expect(toneOf(d as ToneDomain, v)).toBe(tone)
  }
})
it('resolves every state-domain value to a semantic state', () => {
  for (const d of Object.keys(STATE_DOMAINS) as StateDomain[]) {
    for (const v of Object.keys(STATE_DOMAINS[d])) expect(semanticOf(d, v)).not.toBeNull()
  }
  expect(semanticOf('doc', 'review')).toBe('work.pending_decision')
  expect(semanticOf('task', 'canceled')).toBe('history.withdrawn')
  expect(semanticOf('doc', 'unknown')).toBeNull()
})
// region-semantic.test.ts
it('maps UX-07 regions onto the vocabulary without renaming them', () => {
  expect(REGION_SEMANTIC['no-matches']).toBe('data.no_data')
  expect(REGION_SEMANTIC.job).toBe('work.in_progress')
  expect(REGION_SEMANTIC.forbidden).toBeNull()
})
```

- [ ] **Step 2: Run the tests and check they fail.** Run `test:run src/components/aapm/tone src/components/aapm/erp`. Expected: FAIL, because `semanticOf`, `STATE_DOMAINS` and `REGION_SEMANTIC` aren't defined.
- [ ] **Step 3: Implement.** Keep the file's header comment, adding one line on the business → semantic → tone flow.
- [ ] **Step 4: Run the tests and check they pass.** Run the same command. Expected: PASS. Then run `test:run` with no arguments. Expected: no other test changes.

### Task 4: StateChip, FreshnessIndicator and relative time

**Files:**

- Create: `src/components/aapm/tone/state-chip.vue`, `src/components/aapm/tone/freshness-indicator.vue`
- Modify: `src/lib/format-id.ts` (add `formatRelativeId`), `src/pages/ui-kit/components/kit-tones.vue` (demo sections with `id="status-semantik"` and `id="freshness"`)
- Test: `src/lib/__tests__/format-id.test.ts` (extend), `src/components/aapm/tone/__tests__/state-chip.test.ts`

**Interfaces:**

- **Consumes:** `SEMANTIC_STATES`, `stateMeta`, `isSemanticState` (Task 2); `ToneChip` (props `tone`, `icon`, `dot`, `variant`, `size`).
- **Produces:**
  - `formatRelativeId(since: Date | number | undefined, now?: Date | number): string`. It uses `Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })`. Under 60 s, in the future, or with `since` missing, it returns `'baru saja'`.
  - `<StateChip :state="SemanticState" size? variant? />` renders a ToneChip with the vocabulary's tone, icon and label.
  - `<FreshnessIndicator :state="'current'|'stale'|'offline'|'syncing'|'sync_failed'" :since? :now? @retry />`:
    - its text reads `"<label> · Diperbarui <relative>"`;
    - when syncing, the icon carries `data-loading="true"` (the existing spin; reduced motion stops it in CSS);
    - when `sync_failed`, it shows a `Button` "Coba lagi" that emits `retry`.

- [ ] **Step 1: Write the failing tests:**

```ts
it('relative time never reads as the future', () => {
  const now = new Date('2026-11-05T10:00:00+07:00')
  expect(formatRelativeId(new Date(now.getTime() - 12 * 60_000), now)).toBe('12 menit yang lalu')
  expect(formatRelativeId(new Date(now.getTime() - 3 * 3_600_000), now)).toBe('3 jam yang lalu')
  expect(formatRelativeId(new Date(now.getTime() - 86_400_000), now)).toBe('kemarin')
  expect(formatRelativeId(new Date(now.getTime() + 120_000), now)).toBe('baru saja')
  expect(formatRelativeId(undefined, now)).toBe('baru saja')
})
it('renders label and icon for each family', () => {
  for (const s of ['data.error', 'freshness.stale', 'work.blocked', 'history.corrected'] as const) {
    const w = mount(StateChip, { props: { state: s } })
    expect(w.text()).toContain(stateMeta(s).label)
    expect(w.find('svg').exists()).toBe(true)
  }
})
it('unknown state renders a neutral chip with the raw text', () => {
  const w = mount(StateChip, { props: { state: 'work.nope' as never } })
  expect(w.text()).toContain('work.nope')
  expect(w.html()).toContain('data-tone="neutral"')
})
it('freshness shows retry only when sync failed', async () => {
  const w = mount(FreshnessIndicator, { props: { state: 'sync_failed', since: Date.now() - 60_000 } })
  await w.get('button').trigger('click')
  expect(w.emitted('retry')).toHaveLength(1)
  expect(mount(FreshnessIndicator, { props: { state: 'current' } }).find('button').exists()).toBe(false)
})
```

- [ ] **Step 2: Run the tests and check they fail.** Run `test:run src/lib src/components/aapm/tone`. Expected: FAIL, because the files and the function are missing.
- [ ] **Step 3: Implement both components, the function and the two demo sections.** The demos show one row per family, plus FreshnessIndicator in all five states with fixed `since` values.
- [ ] **Step 4: Run the tests and check they pass.** Run the same command. Expected: PASS.

### Task 5: Capability registry, matrix doc and Kapabilitas tab

**Files:**

- Create: `src/design-system/capabilities.ts`, `src/design-system/capability-doc.ts`, `scripts/capabilities-doc.ts`, `docs/design-system/CAPABILITY_MATRIX.md` (generated), `src/pages/ui-kit/components/kit-capabilities.vue`
- Modify: `src/pages/ui-kit/index.vue` (add a `{ value: 'kapabilitas', label: 'Kapabilitas' }` tab rendering `KitCapabilities`), `package.json` (`"capabilities:doc": "node --experimental-strip-types scripts/capabilities-doc.ts"`)
- Test: `src/design-system/__tests__/capabilities.test.ts`

**Interfaces — Produces:**

- `type Capability`, `CapabilitySource` and `CapabilityStatus`, exactly as in the spec.
- `CAPABILITIES: readonly Capability[]`, 83 rows.
- `renderCapabilityMatrix(rows: readonly Capability[]): string`, a Markdown string. It opens with a header line "Generated from src/design-system/capabilities.ts by `pnpm capabilities:doc`", then a counts table by status × sub-project, then one table sorted by sub-project, then priority, then ID.
- `scripts/capabilities-doc.ts` writes that string to `docs/design-system/CAPABILITY_MATRIX.md`. It uses only relative imports with explicit `.ts` extensions, plus type-only imports.

**Filling the registry:**

- **IDs:** take them from the spec.
  - Ecosystem: UI-FND-001–015, UI-DAT-001–017, UI-FRM-001–012 and UI-WRK-READINESS.
  - ERP: R01–R16 and PC01–PC22.
- **Titles:** translate each title from its source row into Bahasa Indonesia.
- **Priority:**
  - UI-* rows take the priority from the Ecosystem table.
  - ERP rows use the priority recorded in their source documents.
  - If a source document gives no priority: R01–R16 = P0 and PC rows = P1.
- **Sub-project:** use the spec routing table.
- **Status:** apply the spec's status rule by inspecting the repo.
  - Each `ada`/`sebagian` row lists its implementing files and a `/ui-kit#anchor` that exists.
  - A row the rule finds `sebagian`/`belum` among the "expected already met" set moves to B2, as the spec says.

- [ ] **Step 1: Write the failing tests:**

```ts
it('has exactly the 83 source rows, unique', () => {
  expect(CAPABILITIES).toHaveLength(83)
  expect(new Set(CAPABILITIES.map(c => c.id)).size).toBe(83)
  expect(CAPABILITIES.filter(c => c.source === 'ecosystem')).toHaveLength(45)
  expect(CAPABILITIES.filter(c => c.source === 'erp-route').map(c => c.id)).toEqual(Array.from({ length: 16 }, (_, i) => `R${String(i + 1).padStart(2, '0')}`))
  expect(CAPABILITIES.filter(c => c.source === 'erp-platform')).toHaveLength(22)
})
it('implemented rows point at real files and real demo anchors', () => {
  const kit = readdirSync('src/pages/ui-kit/components').map(f => readFileSync(join('src/pages/ui-kit/components', f), 'utf8')).join('\n')
  for (const c of CAPABILITIES.filter(c => c.status === 'ada' || c.status === 'sebagian')) {
    expect(c.components.length, c.id).toBeGreaterThan(0)
    for (const f of c.components) expect(existsSync(f), `${c.id}: ${f}`).toBe(true)
    expect(c.demo, c.id).toMatch(/^\/ui-kit#[a-z0-9-]+$/)
    expect(kit, `${c.id} demo`).toContain(`id="${c.demo!.split('#')[1]}"`)
  }
})
it('sebagian and milik-produk rows explain themselves', () => {
  for (const c of CAPABILITIES.filter(c => c.status === 'sebagian' || c.status === 'milik-produk'))
    expect(c.note?.trim(), c.id).toBeTruthy()
})
it('B1 owns the brand source and status semantics', () => {
  expect(CAPABILITIES.find(c => c.id === 'UI-FND-012')).toMatchObject({ subproject: 'B1', status: 'ada' })
  expect(CAPABILITIES.find(c => c.id === 'UI-DAT-008')).toMatchObject({ subproject: 'B1', status: 'ada' })
})
it('the generated matrix doc is current', () => {
  expect(readFileSync('docs/design-system/CAPABILITY_MATRIX.md', 'utf8')).toBe(renderCapabilityMatrix(CAPABILITIES))
})
```

- [ ] **Step 2: Run the tests and check they fail.** Run `test:run src/design-system`. Expected: FAIL, because the modules are missing.
- [ ] **Step 3: Implement the registry, the renderer, the script and the tab.** The tab has filter ToggleGroups for status, sub-project and source; a count summary; and a table of ID, title, status chip, sub-project, priority and demo link. Wrap the table in a labelled scroll region, so the page itself never scrolls sideways.
- [ ] **Step 4: Run the tests and check they pass.** Run `capabilities:doc`, then `test:run src/design-system`. Expected: PASS.

### Task 6: Import boundary, guide and verification

**Files:**

- Create: `src/design-system/__tests__/boundary.test.ts`, `docs/design-system/README.md`
- Modify: any design-system-layer file the guard flags. The fix is to move page-only logic out of the layer, not to list an exception.

**Interfaces — Consumes:** all of the above.

- [ ] **Step 1: Write the failing test:**

```ts
const LAYER = ['src/design-system', 'src/components/aapm', 'src/assets/tokens', 'src/assets/motion', 'src/lib']
const FORBIDDEN = /^@\/(?:pages|stores|router|services|layouts)\b|(?:\.\.\/)+(?:pages|stores|router|services|layouts)\//
const EXCEPTIONS: Record<string, string> = {} // file → reason; starts empty
it('the design-system layer never imports app code', () => {
  // collect import/export-from specifiers (static and dynamic import()) in .ts/.vue under LAYER, skipping __tests__
  expect(offenders.filter(o => !(o.file in EXCEPTIONS))).toEqual([])
})
```

- [ ] **Step 2: Run the test.** Run `test:run src/design-system/__tests__/boundary.test.ts`. Expected: either FAIL listing offenders, or PASS if there are none. Record which happened in the ledger.
- [ ] **Step 3: Fix the offenders and write `docs/design-system/README.md`.** The README covers: the layer map onto the Ecosystem model; `pnpm tokens:sync --from D:/SA/AAPM_Ecosystem`; "add a component = registry row + `/ui-kit` demo anchor + test"; and the boundary rule.
- [ ] **Step 4: Run the full verification.**
  - Run `lint:fix` (then restore the symlink), `test:run`, `vue-tsc --noEmit -p tsconfig.app.json` and `build`. Expected: all green, build exit 0.
  - In the browser, open `/ui-kit` → Kapabilitas, and the status and freshness demos, at 375 and 1280, light and dark. At 375, `document.documentElement.scrollWidth === innerWidth`. Chips read correctly in both themes.
