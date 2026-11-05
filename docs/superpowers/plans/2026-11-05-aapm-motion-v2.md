# AAPM Motion & Interaction v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Smooth, meaningful feedback for every interaction — typing caret, action icons, toasts, select, slider, tabs, radio cards and tables — on top of stock shadcn-vue.

**Architecture:** Each feature is an isolated module: a composable or plugin module in TS, plus its own CSS file under `src/assets/motion/`. Task 0 creates the shared scaffolding (CSS folder, plugin registry hook, coverage test reading the folder); Tasks 1–6 touch disjoint files and can run in parallel; Task 7 wires everything into `/ui-kit` and verifies.

**Tech Stack:** Vue 3.5, motion-v 2.4 (`animate`, `Motion`, `layoutId`), vue-sonner, reka-ui, Tailwind 4, Vitest + happy-dom, pnpm 11.28.8 (`npx -y pnpm@11.28.8 …`).

**Spec:** `docs/superpowers/specs/2026-11-05-aapm-motion-v2-design.md`

## Global Constraints

- `src/components/ui/**` stays stock — attach through `data-slot` / `data-state` / `data-highlighted` / `data-dragging`, tokens, plugins and AAPM components.
- Interaction ≤ 420ms; transform / opacity / scale / rotate / translate only, except `AutoHeight` height and collapsible height.
- All motion inside `@media (prefers-reduced-motion: no-preference)`; the blocked sound still plays under reduced motion.
- No new runtime dependency (no GSAP). Use `motion-v` and `src/lib/sound.ts`.
- Colours only from tokens in `src/assets/tokens/*.css`; text contrast ≥ 4.5:1, UI boundaries ≥ 3:1.
- Copy in Bahasa Indonesia.
- No git commits during execution (session rule: commit only when the user asks). Each task ends with its own tests passing instead.
- Parallel tasks run only their own test files (`test:run <path>`); only Task 7 runs `build` and the full suite.

## Review Focus

1. Long value that scrolls horizontally inside an input — the caret must follow `scrollLeft` and stay inside the field (Task 1 test `measureCaret subtracts scrollLeft and clamps`).
2. IME composition (zh-CN locale exists) — overlay caret hidden while composing, native caret visible (Task 1 test `hides during composition`).
3. Typing fast in a table search — staged list must cancel the pending exit and never leave ghost rows (Task 2 test `rapid changes leave no ghosts`).
4. Password fields — the caret measures masked bullets, not the secret (Task 1 test `measures password as bullets`).
5. Existing direct `toast.error()` / `toast.success()` calls (not via `notify`) — still get the v2 style by `data-type` (Task 4 test `styles every sonner data-type`).

---

### Task 0: Motion scaffolding

**Files:**

- Create: `src/assets/motion/index.css` (imports only), `src/plugins/motion/modules.ts`
- Modify: `src/main.ts` (import `@/assets/motion/index.css` after `@/assets/motion.css`), `src/plugins/motion/setup.ts`, `src/assets/__tests__/motion-coverage.test.ts`

**Interfaces — Produces:**

- `src/assets/motion/<feature>.css` files, each `@import`ed by `src/assets/motion/index.css` in this order: `caret.css`, `table.css`, `icons.css`, `toast.css`, `select.css`, `controls.css` (create each as an empty file with a header comment).
- `export type MotionModule = () => void` and `export const MOTION_MODULES: MotionModule[] = []` in `src/plugins/motion/modules.ts`; `setupMotion()` calls every module once after the DOM is ready.
- Coverage test reads `motion.css` **plus every file in `src/assets/motion/`** as one string.

- [ ] **Step 1:** Add test `it('reads every motion stylesheet')` asserting the combined CSS string contains `aapm-pop-in` and that each of the six feature files exists.
- [ ] **Step 2:** `npx -y pnpm@11.28.8 test:run src/assets` → FAIL (files missing).
- [ ] **Step 3:** Create the files and the hook above; `setupMotion()` runs `MOTION_MODULES.forEach(m => m())` inside its existing `start()`.
- [ ] **Step 4:** `test:run src/assets` → PASS (4 tests).

### Task 1: Smooth caret

**Files:** Create `src/composables/use-smooth-caret.ts`, `src/plugins/motion/caret.ts`, `src/composables/__tests__/use-smooth-caret.test.ts`; write `src/assets/motion/caret.css`.

**Interfaces — Produces:**

- `measureCaret(input: HTMLInputElement, index: number, mirror: HTMLElement): { x: number, height: number, visible: boolean }` — x in px relative to the input's left padding edge, after `scrollLeft`, clamped to `[paddingLeft, clientWidth - paddingRight]`.
- `attachSmoothCaret(input: HTMLInputElement): () => void` — returns a detach function.
- `setupSmoothCaret: MotionModule` — auto-attaches to `input[data-slot="input"]` of type `text | search | email | password | tel | url | number` (and `[data-slot="pin-input-slot"]`), re-scanning on DOM additions; skips `readonly`, `disabled`, `forced-colors`, `devicePixelRatio`-independent zoom ≥ 200% (`visualViewport.scale >= 2`).

Behaviour pinned by the spec: native caret `caret-color: transparent`; overlay 2px wide, `--ring` colour, `aria-hidden`; spring to new x ≈ 90ms (`animate` with `ease: AAPM_EASE.emphasis`, `duration: 0.09`); blink after 600ms idle (CSS `aapm-caret-blink`); hidden while `selectionStart !== selectionEnd`; on deletion scaleY 0.7 → 1 (120ms); when value becomes empty after a deletion, translateX −3px → 0 (160ms) and `sound.play('tick')`; hidden on `compositionstart`, shown on `compositionend`. Placeholder: on the first character, an `aria-hidden` ghost copy of the placeholder text slides 4px right and fades out (160ms), then is removed; add test `ghosts the placeholder on first character` (ghost element exists right after the first `input` event, gone after 200ms).

- [ ] **Step 1: Failing tests** (happy-dom; stub `mirror.getBoundingClientRect` / `offsetWidth`):
  - `measureCaret returns padding-left for an empty value` → `x === paddingLeft`.
  - `measureCaret subtracts scrollLeft and clamps` → value wider than field, `scrollLeft = 40`, expect `x <= clientWidth - paddingRight` and `x === mirrorWidth + paddingLeft - 40` when inside.
  - `measures password as bullets` → mirror text equals `'•'.repeat(index)`, never the real characters.
  - `hides during composition` → after dispatching `compositionstart`, overlay has `data-hidden="true"`; after `compositionend`, removed.
  - `hides while a range is selected` → `setSelectionRange(1, 3)` + `select` event → `data-hidden="true"`.
  - `plays tick when emptied by delete` → spy `sound.play`, set value `'a'` then `''` with `inputType: 'deleteContentBackward'` → called with `'tick'`.
- [ ] **Step 2:** `test:run src/composables/__tests__/use-smooth-caret.test.ts` → FAIL (module missing).
- [ ] **Step 3:** Implement. Mirror: one shared off-screen `<span>` per input copying `font`, `letter-spacing`, `text-transform`, `padding` from computed style. Overlay mounts as a sibling in an inline wrapper only if the input's parent is not already `position: relative` (prefer setting `position: relative` on the existing parent). Push `setupSmoothCaret` into `MOTION_MODULES`.
- [ ] **Step 4:** Tests PASS (6).

### Task 2: Staged table list + AutoHeight

**Files:** Create `src/composables/use-staged-list.ts`, `src/composables/__tests__/use-staged-list.test.ts`, `src/components/aapm/motion/auto-height.vue`; write `src/assets/motion/table.css`; modify `src/components/data-table/data-table.vue`, `src/pages/ui-kit/components/kit-data.vue`.

**Interfaces — Produces:**

- `useStagedList<T>(source: Ref<T[]> | ComputedRef<T[]>, key: (item: T) => string, opts?: { exitMs?: number }): { items: Ref<T[]>, leaving: Ref<Set<string>> }` — default `exitMs = 160`.
- `<AutoHeight :duration?="number">` (default 320) — default slot; animates height via motion `animate(el, { height: [from, to] })`, then sets `height: auto`.
- CSS: `tr[data-leaving="true"]` → opacity 0 + `scale: 1 0.6` origin top over 160ms; reuse existing `.aapm-row-move` / `.aapm-row-enter-*` from `motion.css` (move them into `table.css`).

- [ ] **Step 1: Failing tests** (fake timers):
  - `keeps removed rows during the exit phase` → source `[a,b,c]` → `[a,c]`; immediately `items` still has `b` and `leaving` has `'b'`.
  - `commits the new list after exitMs` → after 160ms, `items` equals `[a,c]`, `leaving` empty.
  - `adds new rows immediately without an exit phase` → `[a]` → `[a,b]` → `items` is `[a,b]` at once.
  - `rapid changes leave no ghosts` → `[a,b,c]` → `[a]` → (50ms) → `[a,d]` → after 160ms `items` equals `[a,d]` exactly.
- [ ] **Step 2:** `test:run src/composables/__tests__/use-staged-list.test.ts` → FAIL.
- [ ] **Step 3:** Implement; in `data-table.vue` feed `table.getRowModel().rows` through `useStagedList(rows, r => r.id)`, render `items`, set `:data-leaving` on rows in `leaving`, wrap the table container in `<AutoHeight>`; same in `kit-data.vue` for `visible`.
- [ ] **Step 4:** Tests PASS (4); `test:run src/components/data-table` still PASS.

### Task 3: Animated action icons

**Files:** Create `src/components/aapm/icon/animated/actions.ts`, `src/components/aapm/icon/animated/animated-icon.vue`, `src/components/aapm/icon/animated/__tests__/animated-icon.test.ts`; write `src/assets/motion/icons.css`; modify `src/components/aapm/icon/AapmIcon.vue`.

**Interfaces — Produces:**

- `type ActionName = 'like' | 'copy' | 'share' | 'refresh' | 'print' | 'delete' | 'save' | 'download' | 'upload' | 'export' | 'notification' | 'filter' | 'sort' | 'chevronDown' | 'submit' | 'approve'`.
- `ANIMATED_ACTIONS: Record<ActionName, { icon: IconName, keyframes: string, trigger: 'press' | 'hover' | 'state', loop?: boolean }>` — `keyframes` is the CSS animation name in `icons.css`, prefixed `aapm-icon-`.
- `<AnimatedIcon :name="ActionName" :play?="boolean" :size? :label? />` — plays on `play` change to true, or on the nearest `button`'s `pointerdown` (press) / `pointerenter` (hover); `refresh` loops while `play` stays true.
- `AapmIcon` gains `animate?: boolean`; when true and `name` is an `ActionName`, it renders `AnimatedIcon`.
- Copy: after the slide, swap to `approve` (check) for 1.2s. Delete: hover lifts the lid; `play` (confirm) runs the tear (two halves split 2px and rejoin, 380ms).

Motion per action is the spec's catalog table (like nod −18°, copy sheet slide, share fly-out/in, refresh 360°, print paper drop, delete lid + tear, arrows travel, bell swing ±14°, funnel compress, sort flip, chevron rotate).

- [ ] **Step 1: Failing tests:**
  - `every action maps to a registry icon` → for each key, `ICONS[ANIMATED_ACTIONS[k].icon]` defined.
  - `every action has keyframes in icons.css` → read the CSS file, each `keyframes` name appears as `@keyframes <name>`.
  - `plays when play turns true` → mount, set `play: true`, root has `data-playing="true"` until `animationend`.
  - `copy swaps to a check` → after playing `copy` and fake 400ms, renders the `approve` icon; after 1.2s back to `copy`.
  - `labelled icons expose a name` → `label="Salin"` gives `role="img"` and `aria-label`.
- [ ] **Step 2:** `test:run src/components/aapm/icon` → FAIL.
- [ ] **Step 3:** Implement; target Lucide SVG children by `:nth-child()` inside `[data-action="<name>"]` selectors in `icons.css`.
- [ ] **Step 4:** Tests PASS (5 new + existing registry tests).

### Task 4: Toast v2

**Files:** Create `src/components/aapm/feedback/notify.ts`, `src/components/aapm/feedback/__tests__/notify.test.ts`; write `src/assets/motion/toast.css`; modify `src/plugins/sound/setup.ts` (toast sound by `data-type` / `data-aapm-toast`).

**Interfaces — Produces:**

- `notify.success(title: string, opts?: ExternalToast)`, `notify.info(…)`, `notify.warning(…)`, `notify.blocking(title: string, opts?: ExternalToast)` — each calls vue-sonner with `class: 'aapm-toast aapm-toast--<type>'`; `blocking` uses `toast.error` and `duration: 6000`.
- Styles keyed by `[data-sonner-toast][data-type=<success|info|warning|error>]`, so direct `toast.*` calls look the same. `error` = solid red background `var(--danger-fill)`, white text, white icon, 4.5:1 checked against `--danger-fill`; others pastel `--<type>-soft` with `--<type>` icon and a 3px left accent.
- Icon motion inside toasts: success check draws (`stroke-dashoffset`), info bell swings, warning triangle nods, error shakes (existing `aapm-shake-x`).
- Remaining-time bar: `::after` 2px bar scaling `scaleX(1 → 0)` over the toast duration (`--aapm-toast-duration`, default 4000ms; paused on hover via `[data-expanded=true]`).

- [ ] **Step 1: Failing tests:**
  - `blocking uses the error channel with the blocking class` → mock `vue-sonner`, `notify.blocking('X')` → `toast.error` called with `class` containing `aapm-toast--blocking`.
  - `success / info / warning call their channel` → each wrapper hits `toast.success|info|warning` with `aapm-toast--<type>`.
  - `styles every sonner data-type` → `toast.css` contains `[data-type='success']`, `'info'`, `'warning'`, `'error'`.
  - `error toast text passes contrast` → parse the `--danger-fill` hex from `tokens/primitives.css`, compute contrast vs `#ffffff` ≥ 4.5 (darken the fill token step if it fails, in `semantic.css` only).
- [ ] **Step 2:** `test:run src/components/aapm/feedback` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Tests PASS (4).

### Task 5: Select in sidebar style

**Files:** Create `src/plugins/motion/select-pill.ts`, `src/plugins/motion/__tests__/select-pill.test.ts`; write `src/assets/motion/select.css`.

**Interfaces — Produces:**

- `setupSelectPill: MotionModule` — for every open `[data-slot="select-content"]` / `[data-slot="dropdown-menu-content"]`, inserts one `[data-aapm-menu-pill]` element that moves (translate + height) to the item with `[data-highlighted]`, mirroring the sidebar's `--nav-active` tint and 3px `--nav-active-indicator` bar; items' own highlight background becomes transparent while the pill exists.
- `select.css`: trigger uses `--sidebar` background on hover and `--nav-active` when open; items 36px tall (`min-height: 2.25rem`), 8px radius, checked item text `--nav-active-foreground`; pill transition 180ms `--aapm-ease-emphasis`.

- [ ] **Step 1: Failing tests** (happy-dom, stub `offsetTop` / `offsetHeight`):
  - `adds one pill per open menu` → render content with 3 items → exactly one `[data-aapm-menu-pill]`.
  - `moves to the highlighted item` → set `data-highlighted` on item 2 → pill `style.translate` contains item 2's `offsetTop`.
  - `hides when nothing is highlighted` → pill `opacity === '0'`.
- [ ] **Step 2:** `test:run src/plugins/motion/__tests__/select-pill.test.ts` → FAIL.
- [ ] **Step 3:** Implement with one `MutationObserver` on `document.body` (childList + `data-highlighted` attribute, subtree); push into `MOTION_MODULES`.
- [ ] **Step 4:** Tests PASS (3).

### Task 6: Slider, tabs contrast, radio cards, sound toggle

**Files:** Create `src/plugins/motion/radio-cards.ts`, `src/plugins/motion/__tests__/radio-cards.test.ts`, `src/components/custom-theme/ui-sound.vue`; write `src/assets/motion/controls.css`; modify `src/components/custom-theme/theme-popover.vue`, `src/pages/ui-kit/components/kit-identity.vue`.

**Interfaces — Produces:**

- `setupRadioCards: MotionModule` — containers marked `[data-aapm-radio-cards]` get one `[data-aapm-card-highlight]` that slides to the card containing `[data-state="checked"]` (translate + size, 320ms emphasis).
- `<UiSound />` in the theme popover: label "Suara antarmuka", shadcn `Switch` bound to `isSoundEnabled()` / `setSoundEnabled()`; turning on plays `sound.play('success')`.
- `controls.css`:
  - Slider: `[data-slot='slider'][data-dragging] *` → `transition: none`; release/track click springs the thumb and range (`transform 280ms var(--aapm-ease-overshoot)`); value bubble via `[data-slot='slider-thumb']::after` showing `attr(aria-valuenow)` while hovered or dragging.
  - Tabs light theme: `[data-aapm-tab-indicator]` gets `background: var(--card)`, `box-shadow: 0 1px 2px rgb(0 0 0 / .08), 0 0 0 1px var(--border)`; tabs list background `var(--muted)`; active trigger text `var(--foreground)` weight 600, inactive `var(--muted-foreground)`.

- [ ] **Step 1: Failing tests:**
  - `radio cards: one highlight per group` and `moves to the checked card` (as Task 5's pill tests, using `offsetLeft/Top/Width/Height`).
  - `ui-sound toggles the stored preference` → mount `UiSound`, toggle switch → `localStorage.getItem('aapm-ui-sound') === 'off'`, toggle again → `'on'` and `sound.play` called with `'success'`.
- [ ] **Step 2:** `test:run src/plugins/motion/__tests__/radio-cards.test.ts src/components/custom-theme` → FAIL.
- [ ] **Step 3:** Implement; add `data-aapm-radio-cards` to the company chooser in `kit-identity.vue`; push `setupRadioCards` into `MOTION_MODULES`; add `<UiSound />` after `<ToggleColorMode />` in `theme-popover.vue`.
- [ ] **Step 4:** Tests PASS (3).

### Task 7: Showcase, coverage and verification

**Files:** Modify `src/pages/ui-kit/components/kit-controls.vue` (caret note in field section, `AnimatedIcon` gallery section "Ikon beranimasi" with one button per `ActionName`), `src/pages/ui-kit/components/kit-overlays.vue` (toast buttons call `notify.*`; blocked action uses `notify.blocking`), `src/assets/__tests__/motion-coverage.test.ts`, spec doc revision notes.

**Interfaces — Consumes:** `ANIMATED_ACTIONS` (Task 3), `notify` (Task 4), `MOTION_MODULES` entries from Tasks 1, 5, 6.

- [ ] **Step 1: Failing tests** in `motion-coverage.test.ts`:
  - `every action icon has an animated variant` → keys of `ANIMATED_ACTIONS` include `like, copy, share, refresh, print, delete`.
  - `every toast type is styled` → combined CSS contains each `[data-type='…']`.
  - `all motion modules are registered` → `MOTION_MODULES.length >= 4` after importing caret, select-pill, radio-cards (and the tabs module refactored into `src/plugins/motion/tabs.ts`).
- [ ] **Step 2:** `test:run src/assets` → FAIL.
- [ ] **Step 3:** Wire the showcase and move the existing tab indicator into `src/plugins/motion/tabs.ts` as `setupTabIndicator: MotionModule`.
- [ ] **Step 4:** `npx -y pnpm@11.28.8 lint:fix` (restore `.github/copilot-instructions.md` afterwards), `test:run` (all green), `build` (exit 0).
- [ ] **Step 5:** Layout auditor: `node <skill>/scripts/run_layout_audit.mjs http://localhost:5173/ui-kit http://localhost:5173/dashboard --viewports 375,1280 --themes light,dark --focus` → 0 blockers; any major explained.
- [ ] **Step 6:** Browser check in a separate tab: caret glides while typing and flicks when emptied; table filter fades leavers in place, movers glide, content below shifts smoothly; select pill follows the keyboard; slider thumb has no lag while dragging; light-theme tabs are distinguishable; blocking toast is solid red and shakes; each icon in "Ikon beranimasi" plays.

---

## Addendum — full scope (Tasks 8–11, see spec addendum)

Tasks 8–11 own disjoint files. None edits `src/assets/motion.css`; overrides go in their own feature CSS, which loads after it. Task 7 runs last and covers these tasks too: coverage lines and the browser check.

### Task 8: Tone chips (categorical status colour)

**Files:**

- Create: `src/assets/tokens/tones.css`, `src/components/aapm/tone/{tone-chip.vue,tones.ts,__tests__/tones.test.ts}`, `src/pages/ui-kit/components/kit-tones.vue`.
- Modify: `status-chip.vue`, tasks/users/billing `columns.ts` and `data.ts`, `data-table/faceted-filter.vue`, `recent-orders.vue`, `exceptions-card.vue`, `brand-board.vue`, `session-center.vue`, `ui-kit/index.vue`.

**Interfaces — Produces:** `Tone`, `TONES`, `toneOf(domain: ToneDomain, value: string): Tone`, and `<ToneChip>` (as in the spec). Each `[data-tone=x]` sets `--tone-bg`, `--tone-fg`, `--tone-border` and `--tone-dot`.

- [ ] **Step 1: Failing tests:**
  - `every domain value maps to a tone`: every value in `TONE_MAP` is in `TONES`.
  - `unknown values fall back to neutral`.
  - `tones.css defines all four variables per tone, light and dark`.
- [ ] **Step 2:** Implement the token values. A script checks contrast first: fg on bg ≥ 4.5:1, and dot on the card ≥ 3:1, in both themes.
- [ ] **Step 3:** Apply the chips everywhere listed under Files; faceted-filter options show the tone dot.
- [ ] **Step 4:** Run `test:run src/components/aapm/tone` → PASS.

### Task 9: Immersive menus

**Files:**

- Modify: `src/plugins/motion/select-pill.module.ts` and its test.
- Create: `src/assets/motion/menus.css`, imported from `src/assets/motion/index.css`.
- Showcase: `src/pages/ui-kit/components/kit-overlays.vue` gets a context menu, a menubar, a command palette, and a dropdown with a submenu.

- [ ] **Step 1: Failing tests:**
  - `pill in context menu / menubar / combobox / command`: each content slot gets exactly one pill.
  - `cascade index`: items get a `--aapm-i` index ≤ 7 on open.
- [ ] **Step 2:** Implement; the motion goes inside `@media (prefers-reduced-motion: no-preference)`.
- [ ] **Step 3:** Run `test:run src/plugins/motion/__tests__/select-pill.test.ts` → PASS. Then check in the browser that keyboard and pointer highlighting both follow the pill.

### Task 10: Pickers

**Files:**

- Create: `src/plugins/motion/calendar.module.ts`, its test, and `src/assets/motion/pickers.css`, imported from `motion/index.css`.
- Showcase: `src/pages/ui-kit/components/kit-controls.vue` gets a new "Pemilih" section.

- [ ] **Step 1: Failing tests:**
  - `month change sets direction`: clicking next sets `data-aapm-dir="next"` on the calendar grid, and clicking prev sets `"prev"`.
  - `range fill marks ends`.
- [ ] **Step 2:** Implement the calendar slide, day pill, range sweep, tags-input chip motion, and number-field roll.
- [ ] **Step 3:** Run the module's tests → PASS. Then check in the browser.

### Task 11: Data-viz motion

**Files:**

- Modify: `src/components/aapm/charts/**` and the dashboard chart cards (`production-trend`, `mortality-heatmap`, `egg-grade-card`, `feed-stock-card`, `house-ranking`, `kpi-card`).
- Create: `src/assets/motion/charts.css`, imported from `motion/index.css`, and `src/pages/ui-kit/components/kit-charts.vue`.

- [ ] **Step 1: Failing tests:**
  - `chart waits for view`: a chart wrapper sets `data-aapm-inview` only once it intersects (mock IntersectionObserver).
  - `reduced motion renders final state`.
- [ ] **Step 2:** Implement the in-view entrance, tweened updates (Unovis `duration`), hover dimming and the legend fade.
- [ ] **Step 3:** Tests PASS; then check the dashboard in the browser, light and dark.
