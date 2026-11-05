# AAPM Brand UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the shadcn-vue-admin fork as the AAPM internal admin with AAPM tokens, a semantic icon set and farm data visualizations.

**Architecture:** Three token layers (primitives → semantic light/dark → component) feed shadcn's existing CSS variables, so every `components/ui` primitive inherits the brand with no behavior change. Icons resolve through one semantic registry compiled by `unplugin-icons`. Charts are small SVG Vue components over pure, tested geometry helpers; the main time-series keeps Unovis.

**Tech Stack:** Vue 3.5, Vite 8, Tailwind 4 (`@theme inline`), shadcn-vue/reka-ui, Unovis, Vitest + @vue/test-utils, pnpm 11.28.8.

**Spec:** `docs/superpowers/specs/2026-11-05-aapm-brand-ui-design.md`

## Global Constraints

- Package manager: `pnpm@11.28.8` (run as `npx -y pnpm@11.28.8 …` on this machine); Node ≥ 22.15.
- Routing is file-based: add pages under `src/pages/**`; never hand-edit route tables. `components/`, `data/`, `types/`, `layouts/` folders are excluded from routes.
- Theme variables live in `src/assets/index.css` (`:root`, `.dark`, `@theme inline`); selectable themes in `src/assets/themes.css`.
- Brand Core hex values are fixed: `#318139`, `#D4451A`, `#FFFFFF`, `#CCCCCC`. Logos are copied, never edited or CSS-inverted.
- Business screens consume semantic tokens/utilities (`bg-card`, `text-brand`, `chart-1`), never raw hex.
- Changes to `src/lib/**`, `src/composables/**`, `src/stores/**`, `src/utils/**` ship with Vitest tests.
- Done means: `pnpm lint:fix` clean, `pnpm build` (vue-tsc + vite) passes, `pnpm test:run` passes, light + dark + 375px checked in a browser.
- Copy: Indonesian sentences, English nav/metric labels, `id-ID` number format, sentence case, no emoji.

## Review Focus

1. A persisted theme from the old app (`zinc`, or an unknown string) must fall back to `aapm` without a console error.
2. Charts receiving empty arrays, a single point, all-zero values or negative deltas must render without `NaN` in SVG paths.
3. `id-ID` formatting of negatives, decimals and compact Rupiah (`-1.234,5`, `Rp 1,2 M`) must be exact.
4. Dark mode must show `*-dark.svg` logo files (light file never shown on graphite).
5. Collapsed sidebar rail must still show every nav icon at 18–20px and keep tooltips.

---

### Task 1: Foundation — deps, brand assets, fonts, meta

**Files:**

- Modify: `package.json`, `vite.config.ts`, `tsconfig.app.json`, `index.html`, `src/config/site.ts`, `src/main.ts`
- Create: `public/brand/aapm-logo.svg`, `public/brand/aapm-logo-dark.svg`, `public/brand/aapm-icon.svg`, `public/brand/aapm-icon-dark.svg`; replace `public/logo.svg`, `public/logo-dark.svg`

- [ ] Add deps: `@fontsource-variable/plus-jakarta-sans`, `@fontsource-variable/jetbrains-mono`; devDeps `unplugin-icons`, `@iconify-json/solar`, `@iconify-json/ph`.
- [ ] Register `Icons({ compiler: 'vue3' })` in `vite.config.ts`; add `"unplugin-icons/types/vue"` to `tsconfig.app.json` `types`.
- [ ] Copy the four canonical SVGs; favicons use the icon (light file on light scheme, dark file on dark).
- [ ] `index.html`: title `AAPM Admin`, Indonesian description, `theme-color` `#318139`. `SITE_CONFIG` name/logo paths → AAPM.
- [ ] Import both fontsource packages in `src/main.ts`.
- [ ] Verify: `npx -y pnpm@11.28.8 build` passes.

### Task 2: Design tokens and primitive restyle

**Files:**

- Create: `src/assets/tokens/primitives.css`, `src/assets/tokens/semantic.css`, `src/assets/tokens/components.css`
- Modify: `src/assets/index.css`, `src/assets/themes.css`, `src/assets/chart-theme.css`, `src/constants/themes.ts`, `src/stores/theme.ts`, `src/composables/use-system-theme.ts`, `src/components/ui/card/Card.vue`, `src/components/ui/button/index.ts`
- Test: `src/composables/__tests__/use-system-config.test.ts`

**Interfaces — Produces:**

- shadcn vars (`--background … --sidebar-ring`, `--chart-1..5`) with AAPM values in `:root` and `.dark`.
- Extra semantic vars + Tailwind colors: `brand`, `brand-accent`, `highlight`, `canvas`, `surface-tint`, `success|warning|danger|info` (+ `-foreground`, `-soft`), `chart-grid`, `chart-axis`, `seq-1..5`.
- Utilities: `overline`, `numeric` (tabular), `font-mono`, `shadow-card`, `shadow-card-hover`, `ease-out-aapm`, `animate-rise`, `radius-card`.
- `THEMES` starts with `'aapm'`; `THEME_PRIMARY_COLORS[0] = { theme: 'aapm', primaryColor: '#318139' }`; store default theme `'aapm'`, radius `0.75`.

- [ ] **Step 1: Failing test** in `use-system-config.test.ts`: `it('falls back to aapm when the persisted theme is unknown')` — set store theme to `'zinc-legacy' as Theme`, mount `useSystemTheme()`, expect `document.documentElement.classList.contains('theme-aapm')` true.
- [ ] **Step 2:** Run `npx -y pnpm@11.28.8 test:run src/composables` → FAIL.
- [ ] **Step 3:** In `useSystemTheme`, apply `theme-${THEMES.includes(t) ? t : 'aapm'}` and reset the store value when unknown.
- [ ] **Step 4:** Run tests → PASS.
- [ ] **Step 5:** Write token files with the spec's values (light Soft Structural, dark Dark Operator, chart palette exactly as the spec's validated lists). Card: `rounded-(--radius-card) border-border/70 shadow-card` + `gap-5 py-5`. Button: `rounded-(--radius-control)`, `font-semibold`, `active:translate-y-px`, transitions on `ease-out-aapm`.
- [ ] **Step 6:** `pnpm build` passes.

### Task 3: Indonesian formatters

**Files:** Create `src/lib/format-id.ts`; Test `src/lib/__tests__/format-id.test.ts`

**Interfaces — Produces:** `formatNumber(n: number, digits?: number): string`, `formatPercent(n: number, digits = 1): string` (input is percent units, `92.4 → "92,4%"`), `formatRupiah(n: number, opts?: { compact?: boolean }): string`, `formatCompact(n: number): string` (`12_450 → "12,5 rb"`, `1_250_000 → "1,3 jt"`, `1_200_000_000 → "1,2 M"`), `formatSigned(n: number, digits = 1, suffix = '%'): string` (`-1.25 → "−1,3%"`, `0 → "0,0%"`).

- [ ] **Step 1: Failing tests:** `formatNumber(12450) === '12.450'`; `formatNumber(-1234.5, 1) === '-1.234,5'`; `formatPercent(92.4) === '92,4%'`; `formatRupiah(482650000) === 'Rp 482.650.000'`; `formatRupiah(1_200_000_000, { compact: true }) === 'Rp 1,2 M'`; `formatCompact(950) === '950'`; `formatSigned(3.2) === '+3,2%'`; `formatSigned(-1.25) === '−1,3%'`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement with `Intl.NumberFormat('id-ID')`; normalize non-breaking spaces to plain spaces. **Step 4:** Run → PASS.

### Task 4: Chart geometry helpers

**Files:** Create `src/lib/chart-geometry.ts`; Test `src/lib/__tests__/chart-geometry.test.ts`

**Interfaces — Produces:**

- `linearScale(domain: [number, number], range: [number, number]): (v: number) => number` — zero-width domain maps to range midpoint.
- `linePath(values: number[], width: number, height: number, pad?: number): string`
- `areaPath(values: number[], width: number, height: number, pad?: number): string`
- `donutArcs(values: number[], opts: { radius: number, thickness: number, gapDeg?: number }): { d: string, start: number, end: number, value: number, share: number }[]`
- `niceTicks(min: number, max: number, count?: number): number[]`
- `bucket(value: number, thresholds: number[]): number` — index into a sequential ramp.

- [ ] **Step 1: Failing tests:** `linePath([], 100, 20) === ''`; `linePath([5], 100, 20)` contains no `NaN`; `linePath([0,0,0], …)` has no `NaN`; `donutArcs([0,0], …)` returns `[]`; `donutArcs([1,1], { radius: 50, thickness: 10 })` shares sum to 1; `niceTicks(0, 97)` equals `[0, 20, 40, 60, 80, 100]`; `bucket(0, [1,3,5]) === 0`, `bucket(4, [1,3,5]) === 2`, `bucket(9, [1,3,5]) === 3`.
- [ ] **Step 2–4:** FAIL → implement → PASS.

### Task 5: Semantic icon registry

**Files:** Create `src/components/aapm/icon/registry.ts`, `src/components/aapm/icon/AapmIcon.vue`; Test `src/components/aapm/icon/__tests__/registry.test.ts`

**Interfaces — Produces:** `ICONS: Record<IconName, Component>`; `type IconName`; `<AapmIcon name: IconName size?: number|string label?: string />` (decorative → `aria-hidden`, labelled → `role="img"` + `aria-label`). Groups: navigation, actions, status, analytics, finance, farm (egg, flock, feed, mortality, house, water, temperature, vaccine, weight, production), logistics, users, theme.

- [ ] **Step 1: Failing test:** every key in `ICONS` is a defined component; `navData` (Task 7) icons are components; mounting `AapmIcon` with `label="Telur"` renders `role="img"`.
- [ ] **Step 2–4:** FAIL → implement → PASS.

### Task 6: AAPM chart kit

**Files:** Create in `src/components/aapm/charts/`: `sparkline.vue`, `trend-delta.vue`, `bullet-chart.vue`, `donut-chart.vue`, `heatmap.vue`, `bar-list.vue`, `chart-legend.vue`, `chart-tooltip.vue`. Modify `src/components/ui/chart/ChartTooltipContent.vue` only for token classes if needed.

**Interfaces — Consumes:** Task 3 formatters, Task 4 geometry. **Produces:**

- `Sparkline { values: number[], tone?: 'brand'|'muted'|'accent', area?: boolean, height?: number }`
- `TrendDelta { value: number, goodWhen?: 'up'|'down', suffix?: string, period?: string }`
- `BulletChart { label: string, actual: number, target: number, max: number, unit?: string, bands?: [number, number] }`
- `DonutChart { items: { label: string, value: number, color: string }[], centerLabel: string, format?: (n: number) => string }`
- `Heatmap { rows: string[], cols: string[], values: number[][], thresholds: number[], format?: (n: number) => string }`
- `BarList { items: { label: string, value: number, meta?: string }[], max?: number, format?: (n: number) => string, highlight?: string }`
- Every chart: hover tooltip, legend for ≥ 2 series, `role="img"` + `aria-label` summary.

- [ ] Implement with the spec's mark specs; colors only via `var(--chart-n)` / `var(--seq-n)`.
- [ ] `pnpm build` passes.

### Task 7: Shell, sidebar and auth branding

**Files:** Modify `src/components/app-sidebar/{types.ts,team-switcher.vue,index.vue,data/sidebar-data.ts}`, `src/constants/sidebar-data.ts`, `src/layouts/default.vue`, `src/components/global-layout/{basic-header.vue,types.ts}`, `src/pages/auth/components/auth-title.vue`; Create `src/components/aapm/brand-mark.vue`

**Interfaces — Produces:** `NavIcon = Component`; `Team { name, plan, logo?: Component }`; `<BrandMark variant="icon"|"logo" class />` (swaps `-dark` asset via `useColorMode`); `LayoutHeaderProps` gains `overline?: string`.

- [ ] Nav icons → `ICONS.*`; add `Brand kit` (`/brand`) under "Other". Teams: `AAPM Farm Payakumbuh` (Operations), `AAPM Academy` (Learning), `AAPM ERP` (Finance).
- [ ] Top bar: `h-14`, `bg-background/80 backdrop-blur-xl`, hairline. BasicHeader: overline + 24–30px title, `-0.03em`.
- [ ] Sidebar user: `Rahmat Hidayat`, `rahmat.hidayat@aapm.co.id`.

### Task 8: Farm overview dashboard

**Files:** Modify `src/pages/dashboard/index.vue`; Replace `src/pages/dashboard/components/*` with `kpi-card.vue`, `production-trend.vue`, `egg-grade-card.vue`, `exceptions-card.vue`, `mortality-heatmap.vue`, `feed-stock-card.vue`, `house-ranking.vue`, `recent-orders.vue`, `overview-content.vue`; Create `src/pages/dashboard/data/farm-overview.ts`

**Interfaces — Consumes:** Tasks 3–7. Data module exports typed constants: `kpis`, `productionSeries` (90 days: `date`, `hdp`, `standard`, `eggsKg`), `gradeMix`, `exceptions`, `mortalityGrid` (8 houses × 12 weeks), `feedStock`, `houseOutput`, `recentOrders`.

- [ ] Bento (lg 12-col): KPI row (4) → trend 8 + grade donut 4 → heatmap 8 + exceptions 4 → feed bullets 5 + house ranking 7 → orders table 12. Mobile: single column.
- [ ] Trend card: Unovis lines (HDP vs standard, one % axis), area wash, crosshair tooltip, range select 7/30/90, `Grafik | Tabel` toggle.
- [ ] Staggered `animate-rise` per row.

### Task 9: Brand kit & design-system page

**Files:** Create `src/pages/brand/index.vue`, `src/pages/brand/components/{brand-board.vue,token-swatches.vue,type-specimen.vue,icon-gallery.vue,chart-palette.vue}`

- [ ] 3×3 board: logo cover, logo on dark, digital application (mini top bar), essence ("Pelayanan prima. Produk bermutu. Mitra terpercaya."), color system, typography, physical application (egg-tray label), image direction (green field + lime), system detail (chips/status/icon row).
- [ ] Below: swatches (hex + role, light & dark), type scale, radius & elevation, full icon gallery from `ICONS`, validated chart palette with contrast notes.

### Task 10: Verification

- [ ] `npx -y pnpm@11.28.8 lint:fix` → no errors.
- [ ] `npx -y pnpm@11.28.8 test:run` → all pass.
- [ ] `npx -y pnpm@11.28.8 build` → success.
- [ ] Dev server: screenshot `/dashboard` and `/brand` in light, dark and 375px; check tooltips, collapsed rail, no console errors.
