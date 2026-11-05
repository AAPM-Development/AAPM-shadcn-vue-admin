# AAPM UI (Vue) — B1 Foundation Design

|             |                                                                                                                                                                                                                                                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date        | 2026-11-05                                                                                                                                                                                                                                                                                                                    |
| Status      | Approved in conversation; awaiting written-spec review                                                                                                                                                                                                                                                                        |
| Sub-project | B1 of B1–B4 (AAPM UI for Vue)                                                                                                                                                                                                                                                                                                 |
| Sources     | `AAPM_Ecosystem` @ `a75b57d`: `docs/design-system/brand/tokens/aapm-brand.tokens.json` (v1.1.0), `docs/design-system/brand/AAPM_BRAND_DESIGN.md`, `docs/ux-map/ECOSYSTEM_UI_CAPABILITY_REQUIREMENTS.md` (§7, §17); `erp.aapm.co.id` docs: `MIGRATION_PARITY_MATRIX.md` (R01–R16), `PLATFORM_CAPABILITY_WIRING.md` (PC01–PC22) |

## Goal

Give this AAPM Vue template a governed foundation:

- brand values come from the Ecosystem's canonical token file, not hand-copied hex;
- the Ecosystem's shared state vocabulary becomes first-class semantic status;
- one capability matrix tracks every requirement the template must meet;
- the design-system layer stays package-ready.

## Decisions (from the user)

- **Vue, new.** This is a new AAPM UI for Vue. It is not an adapter for `@ten4seven/ui` or Tamagui. The brand layer still follows the Ecosystem: Brand Core, Digital Extension, status semantics and icon semantics are stack-independent, and their authority stays there.
- **Template first, package later.** This repo is the complete AAPM Vue template, and a new internal app starts from a fork of it. Package extraction (`@aapm/ui-vue`) waits for a second real consumer.
- **One merged capability matrix.** It combines the Ecosystem generic UI requirements (45) with the ERP requirements (R01–R16, PC01–PC22) into 83 rows. Each row is routed to B1–B4.

## Constraints

- `src/components/ui/**` stays stock shadcn-vue. shadcn token names and their neutral values stay intact.
- Brand Core values are never changed. Ramps and tints derived from them stay local and are labelled as theme derivation, which the Ecosystem allows.
- Categorical colour on chips stays exactly as the user approved it. Introducing semantics must not repaint any existing chip.
- Bahasa Indonesia copy. Light and dark themes. Text ≥ 4.5:1. Colour is never the only signal.
- No new runtime dependencies. No ESLint plugin additions.

## Units

| Unit                      | Files                                                                                                                                                                                  | Interface                                                                                                       | Responsibility                                                                                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand source              | `src/design-system/brand/aapm-brand.tokens.json`, `src/design-system/brand/SOURCE.md`                                                                                                  | —                                                                                                               | A vendored copy of the Ecosystem file. `SOURCE.md` records the source path, the commit (`a75b57d`) and the date, plus the rule "never edit by hand; run `tokens:sync`".                                     |
| Token sync                | `scripts/sync-brand-tokens.mjs`, `package.json` script `tokens:sync`                                                                                                                   | `node scripts/sync-brand-tokens.mjs [--from <ecosystem-root>]`                                                  | With `--from`: copies the JSON from `<root>/docs/design-system/brand/tokens/`. Always regenerates `src/assets/tokens/brand.generated.css`. Exits non-zero on an unresolved `{ref}` or a non-colour `$type`. |
| Generated brand CSS       | `src/assets/tokens/brand.generated.css`, imported first by `src/assets/index.css`                                                                                                      | CSS variables (below)                                                                                           | `:root` variables only, with a header comment "generated — do not edit".                                                                                                                                    |
| Primitives                | `src/assets/tokens/primitives.css` (modify)                                                                                                                                            | existing names kept                                                                                             | Master values point at the generated variables (`--aapm-core-green: var(--aapm-brand-core-green)` and so on). Ramps stay local.                                                                             |
| Semantic state vocabulary | `src/design-system/states.ts`                                                                                                                                                          | `SEMANTIC_STATES`, `SemanticState`, `stateMeta(state)`                                                          | The Ecosystem §17 families plus two documented AAPM extensions (below).                                                                                                                                     |
| Business mapping          | `src/components/aapm/tone/tones.ts` (modify)                                                                                                                                           | `TONE_MAP` unchanged in shape; new `STATE_DOMAINS`; `semanticOf(domain, value)`; `toneOf()` keeps its signature | State domains resolve value → semantic state → tone, with an optional tone override per value. Categorical domains keep direct tones.                                                                       |
| StateChip                 | `src/components/aapm/tone/state-chip.vue`                                                                                                                                              | `<StateChip :state="'work.blocked'" size? variant? />`                                                          | A ToneChip with the vocabulary's label, icon and tone. The full label stays available to assistive tech.                                                                                                    |
| FreshnessIndicator        | `src/components/aapm/tone/freshness-indicator.vue`                                                                                                                                     | `<FreshnessIndicator :state="'stale'" :since="Date" />`                                                         | Dot plus label plus relative time in `id-ID` ("Diperbarui 12 menit lalu"). Syncing rotates its icon and respects reduced motion. `sync_failed` shows a retry slot.                                          |
| Region mapping            | `src/components/aapm/erp/types.ts` (modify)                                                                                                                                            | `REGION_SEMANTIC: Record<RegionState, SemanticState \| null>`                                                   | Maps the ERP UX-07 states onto the vocabulary without renaming them (below).                                                                                                                                |
| Capability registry       | `src/design-system/capabilities.ts`                                                                                                                                                    | `CAPABILITIES: Capability[]`, `type Capability` (below)                                                         | The single source for all 83 rows.                                                                                                                                                                          |
| Matrix views              | `src/pages/ui-kit/components/kit-capabilities.vue` (new tab "Kapabilitas" in `src/pages/ui-kit/index.vue`); `scripts/capabilities-doc.mjs` → `docs/design-system/CAPABILITY_MATRIX.md` | `pnpm capabilities:doc`                                                                                         | The tab offers filters for status, sub-project, source and priority, plus counts. The MD file is generated from the registry.                                                                               |
| Guide                     | `docs/design-system/README.md`                                                                                                                                                         | —                                                                                                               | Maps the layers onto the Ecosystem model (Brand → Semantic → Components → Patterns → Template → Screens). Covers the sync procedure and "add a component = registry row + demo anchor + test".              |

### Generated CSS variables

Each `$value` becomes `--aapm-brand-<path>`, with the JSON path in kebab-case.

| Source            | Variables                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `brand.core.*`    | `--aapm-brand-core-green`, `-orange`, `-white`, `-neutral-dark-variant`                                                          |
| `brand.digital.*` | `--aapm-brand-digital-lime`, `-lime-soft`, `-deep-green`, `-warm-canvas`, `-green-tint`, `-soft-surface`, `-ink`                 |
| `semantic.*`      | Resolved as `var()` references to the primitives above, e.g. `--aapm-brand-semantic-brand-primary: var(--aapm-brand-core-green)` |

### Semantic state vocabulary

The default tone comes from the existing `TONES`. The icon is a Lucide glyph registered in the semantic icon registry, and the unit adds any missing intent to the registry. Labels are `id-ID`.

| Family                  | State            | Tone    | Icon (Lucide)  | Label              |
| ----------------------- | ---------------- | ------- | -------------- | ------------------ |
| data                    | loading          | neutral | loader-circle  | Memuat             |
| data                    | ready            | green   | circle-check   | Siap               |
| data                    | empty            | neutral | inbox          | Kosong             |
| data                    | no_data          | neutral | circle-slash   | Tidak ada data     |
| data                    | error            | red     | circle-x       | Gagal dimuat       |
| data                    | retrying         | amber   | refresh-cw     | Mencoba lagi       |
| data                    | partial          | amber   | circle-dashed  | Sebagian           |
| freshness               | current          | green   | circle-check   | Terkini            |
| freshness               | stale            | amber   | clock-alert    | Belum diperbarui   |
| freshness               | offline          | neutral | wifi-off       | Luring             |
| freshness               | syncing          | blue    | refresh-cw     | Menyinkronkan      |
| freshness               | sync_failed      | red     | circle-x       | Gagal sinkron      |
| work                    | unassigned       | neutral | circle-dashed  | Belum ditugaskan   |
| work                    | assigned         | blue    | user-check     | Ditugaskan         |
| work                    | pending          | amber   | clock          | Menunggu           |
| work                    | pending_review   | violet  | eye            | Menunggu review    |
| work                    | pending_decision | pink    | scale          | Menunggu keputusan |
| work                    | conditional      | teal    | list-checks    | Bersyarat          |
| work                    | hold             | orange  | pause          | Ditahan            |
| work                    | blocked          | red     | ban            | Terblokir          |
| work                    | exception        | red     | triangle-alert | Pengecualian       |
| work                    | delayed          | orange  | timer          | Terlambat          |
| work                    | completed        | green   | circle-check   | Selesai            |
| work                    | terminal         | neutral | lock-keyhole   | Final              |
| history                 | corrected        | blue    | pencil         | Dikoreksi          |
| history                 | superseded       | neutral | layers         | Digantikan         |
| history                 | reopened         | amber   | rotate-ccw     | Dibuka kembali     |
| history                 | withdrawn        | neutral | undo-2         | Ditarik            |
| history                 | rejected         | red     | circle-x       | Ditolak            |
| history                 | invalidated      | red     | circle-slash   | Dibatalkan         |
| work _(AAPM extension)_ | draft            | neutral | edit           | Draf               |
| work _(AAPM extension)_ | in_progress      | blue    | loader         | Sedang berjalan    |

Extensions exist because ERP drafts and in-flight work have no Ecosystem equivalent. Each one is marked `extension: true` with that rationale, and none redefines an Ecosystem state.

### Business → semantic mapping

**State domains** map through the vocabulary. A `tone` override keeps today's approved colour wherever it differs from the semantic default.

| Domain  | Value → semantic state (tone override)                                                                                                                                                                                                                                                          |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| doc     | draft → work.draft · submitted → work.pending_review (blue) · review → work.pending_decision (amber) · verified → work.pending (teal) · posted → work.completed · paid → work.terminal (green) · rejected → history.rejected · reversed → history.invalidated (violet) · locked → work.terminal |
| task    | backlog → work.unassigned · todo → work.assigned · in progress → work.in_progress (amber) · done → work.completed · canceled → history.withdrawn (red)                                                                                                                                          |
| billing | paid → work.completed · unpaid → work.pending · overdue → work.delayed (red) · cancelled → history.withdrawn                                                                                                                                                                                    |
| order   | draft → work.draft · shipped → work.in_progress · paid → work.completed · due → work.pending                                                                                                                                                                                                    |

**Categorical domains** keep direct tones: `priority`, `label`, `role`, `plan`, `severity`, `user`, `session`. These are categories or identity lifecycles, which the Ecosystem vocabulary does not cover. Business meaning still never maps to a raw colour.

### Region (UX-07) → vocabulary

| RegionState                                               | Semantic state                                                       |
| --------------------------------------------------------- | -------------------------------------------------------------------- |
| loading                                                   | data.loading                                                         |
| empty                                                     | data.empty                                                           |
| no-matches                                                | data.no_data                                                         |
| server-error                                              | data.error                                                           |
| offline                                                   | freshness.offline                                                    |
| job                                                       | work.in_progress                                                     |
| validation, forbidden, conflict, session-expired, missing | `null` (access and integrity states owned by the ERP UX-07 contract) |

### Capability registry

```ts
type CapabilitySource = 'ecosystem' | 'erp-route' | 'erp-platform'
type CapabilityStatus = 'ada' | 'sebagian' | 'belum' | 'milik-produk'
interface Capability {
  id: string // 'UI-DAT-010' | 'R05' | 'PC07'
  title: string // Bahasa Indonesia
  source: CapabilitySource
  priority: 'P0' | 'P1' | 'P2'
  subproject: 'B1' | 'B2' | 'B3' | 'B4'
  status: CapabilityStatus
  components: string[] // repo-relative files that implement it; [] when belum / milik-produk
  demo?: string // '/ui-kit#<anchor>'; required when status is 'ada' or 'sebagian'
  note?: string // what is missing for 'sebagian'; owner for 'milik-produk'
}
```

**Status rule, applied once while filling the registry:**

- `ada`: a component in `components/aapm` or `components/ui` meets the requirement, and `/ui-kit` demos it.
- `sebagian`: a component exists but misses a named contract item. `note` names that item.
- `belum`: no component exists.
- `milik-produk`: backend, operations or domain authority, per the Ecosystem ownership model. A UI surface may still appear in B4.

The ERP rows use the priority recorded in their source documents. Where a source document gives no priority, R01–R16 are P0 (the pilot) and PC rows are P1.

**Routing:**

| Sub-project                                                                                                               | Rows                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| B1                                                                                                                        | UI-FND-012 (exact brand source), UI-DAT-008 (status chip semantics)                                                                            |
| B2 — generic patterns                                                                                                     | UI-FND-002, -003, -004, -014; UI-DAT-009, -010, -011, -015, -016; UI-FRM-006, -008, -009, -010, -011; UI-WRK-READINESS; PC05, PC09, PC11, PC17 |
| B3 — ERP pilot                                                                                                            | R01–R16; UI-DAT-003; UI-FRM-012; PC06, PC07, PC08, PC10, PC12, PC15, PC16                                                                      |
| B4 — remaining                                                                                                            | UI-DAT-002; UI-FND-009, -015; PC13, PC14, PC19; PC01–PC04 hardening; PC18, PC20, PC21, PC22 (status surfaces only)                             |
| Expected already met: routed B1 for the record when the rule yields `ada`; routed B2 when it yields `sebagian` or `belum` | UI-FND-001, -005, -006, -007, -008, -010, -011, -013; UI-DAT-001, -004, -005, -006, -007, -012, -013, -014, -017; UI-FRM-001–005, -007         |

## Package-ready boundary

The design-system layer covers `src/design-system/**`, `src/components/aapm/**`, `src/assets/tokens/**`, `src/assets/motion/**` and `src/lib/**`.

That layer must not import `@/pages`, `@/stores`, `@/router`, `@/services` or `@/layouts`, by alias or by relative path.

A vitest guard scans the import specifiers in those files. Any exception has to be listed by file with its reason in the guard itself, and the list starts empty. Violations found at introduction are fixed in B1, not listed.

## Testing

- **Brand tokens:**
  - every `$value` in the vendored JSON appears in `brand.generated.css` under its variable;
  - regenerating in memory matches the file byte-for-byte;
  - no Brand Core or Digital hex (`#318139`, `#d4451a`, `#b4e717`, `#c3ec45`, `#2c7433`, `#f6f5f2`, `#f2fcf3`, `#eff5ef`, `#10191a`, `#cccccc`) appears as a literal outside the generated file, the vendored JSON, SVG assets, test files and comments. The match is case-insensitive. An unrelated use of the same value switches to a token instead of being listed as an exception.
- **Vocabulary:**
  - every state has a tone from `TONES`, a registered icon and a non-empty label;
  - extension states are flagged;
  - the 30 Ecosystem states are present exactly.
- **Mapping:**
  - every value in a state domain resolves to an existing semantic state;
  - `toneOf()` returns today's tone for every existing value (no repaint);
  - unknown values stay neutral.
- **Registry:**
  - exactly 83 rows with unique IDs;
  - every source ID appears (45 Ecosystem + 16 R + 22 PC);
  - `ada`/`sebagian` rows have existing component files and a demo anchor present in `/ui-kit` sources;
  - the generated MD matches the registry.
- **Boundary:** the import guard above.
- **Components:**
  - StateChip renders the label and an icon for each family;
  - FreshnessIndicator formats relative time in `id-ID` and never animates under reduced motion.
- **Manual:**
  - the `/ui-kit` "Kapabilitas" tab at 375 and 1280, light and dark;
  - StateChip and FreshnessIndicator demos;
  - full suite, `vue-tsc`, `build` and `lint` green.

## Non-goals

- Building the components marked `belum` (B2–B4).
- Package extraction.
- Interop with `@ten4seven/ui` or Tamagui.
- Changing Brand Core values or Ecosystem documents.
- Renaming `RegionState`.
- Repainting existing chips.

## Amendments (final review, 2026-11-05)

- **Demo for partial rows.** A `sebagian` row may have no `/ui-kit` demo when its `note` names the missing demo. `ada` still requires a live anchor. Several features exist app-wide but were never demoed (shell, breadcrumbs, KPI cards); B2 adds those demos.
- **FreshnessIndicator copy.** The time reads "Terakhir diperbarui <relative>", and it is left out when `since` is unknown. "Diperbarui baru saja" for unknown data would claim a freshness nobody knows, and "Belum diperbarui · Diperbarui 3 jam yang lalu" contradicted itself. Only the state is a live region. The relative time ticks every 30 s while mounted.
- **Relative days** count by calendar date from 24 hours on ("kemarin dulu" for two calendar days back). About a year reads as a year.
- **`tokens:sync`** accepts `--from <root>` and `--from=<root>` and rejects any other argument. `$type` is inherited from groups, and an alias without `$type` takes its target's type (DTCG).
- **Demo links:** `/ui-kit#<anchor>` opens the tab that holds the anchor (`src/pages/ui-kit/components/kit-anchors.ts`) and scrolls to it. The router leaves in-page hash changes to the page.
- **Statuses revised:** UI-FRM-001, UI-FRM-002, UI-FND-008 and UI-FND-002 are `sebagian` and routed to B2. The new counts are ada 6 · sebagian 36 · belum 37 · milik-produk 4 (B1 6 · B2 38 · B3 25 · B4 14).
