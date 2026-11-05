# AAPM Data-Viz Direction — "Quiet canvas, living data"

Status: adopted 2026-11-05 · Applies to every chart, stat tile and data table in the AAPM admin.
Method: the `dataviz` skill procedure (form → colour by job → validate → marks → hover → a11y → look),
with the visual layer from top-design / high-end-visual-design and the layout gate from
ui-ux-layout-standards. Code lives in `src/components/aapm/charts/**`, tokens in
`src/assets/tokens/{semantic,components}.css`, motion in `src/assets/motion/charts.css`.

## 1. Concept

|                      |                                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Essence**          | _Quiet canvas, living data._ The page is monochrome; colour exists only where data or state lives.                                             |
| **Tension**          | Still, editorial surfaces ↔ data that breathes (draws in, follows the pointer, pulses "today").                                                |
| **Signature moment** | **Scrub-to-read**: drag across the production trend and the hero number becomes the day under your finger, with its gap to the breed standard. |
| **Restraint**        | One hero number per view. One accent hue per chart unless series identity needs more. No 3D, no gradients on bars, no dual axes.               |

## 2. Tokens (the only colours a chart may use)

**Categorical** — fixed order, never cycled; a 6th series folds into "Lainnya" or small multiples.

| Slot        | Light            | Dark      | Role                                                                              |
| ----------- | ---------------- | --------- | --------------------------------------------------------------------------------- |
| `--chart-1` | `#318139` green  | `#3DA654` | the farm's own series (HD aktual, produksi)                                       |
| `--chart-2` | `#2593B8` teal   | `#2D9BC0` | comparison / second entity                                                        |
| `--chart-3` | `#D4451A` orange | `#E0612D` | brand accent — attention series                                                   |
| `--chart-4` | `#7B5CD6` violet | `#8B73E6` | fourth entity                                                                     |
| `--chart-5` | `#8CB80F` lime   | `#7FA312` | fifth entity — **light mode needs visible labels or a table (2.28:1 vs surface)** |

Validator (`validate_palette.js`, 2026-11-05): light — all checks pass, worst adjacent CVD ΔE 17.0;
contrast WARN on lime only. Dark (surface `#262626`) — all pass, worst CVD ΔE 15.9.

**Sequential** — one hue, light → dark: `--seq-0 … --seq-5` (green ramp). Heatmaps, intensity.
**Diverging** — not yet needed; when it is: `--chart-2` ↔ `--chart-3` with a neutral `--seq-0` midpoint.
**Status** — `--success / --warning / --danger / --info` (+ `-soft`) are reserved for state and never
reused as "series 4"; they always ship with an icon + label. **Targets / standards** — `--chart-target`
(dashed 4/4 for a standard line, a 2px bar for a bullet target). **Chrome** — `--chart-grid`
(hairline), `--chart-axis` (tick text).

**Component tokens** (`components.css`): `--chart-line-width: 2px`, `--chart-bar-max: 24px`,
`--chart-mark-gap: 2px`, `--chart-area-opacity: .1`, `--chart-area-top: .2` (gradient wash top),
`--chart-dim: .28` (out-of-focus), `--chart-enter: 800ms`, `--chart-tween: 480ms`,
`--chart-tooltip-bg`, `--chart-hit-min: 24px`.

## 3. Form by job

| The data's job                | Form                                                                  | AAPM component                      |
| ----------------------------- | --------------------------------------------------------------------- | ----------------------------------- |
| One headline number           | Stat tile / hero figure (≥ 44px, sans semibold, proportional figures) | `kpi-card.vue`, production readout  |
| Change over time              | Line (+ 10–20% area wash), crosshair readout                          | `production-trend.vue`, `Sparkline` |
| Rank / compare entities       | Horizontal bar list, value at the tip                                 | `BarList`                           |
| Progress to a target          | Bullet with qualitative bands                                         | `BulletChart`                       |
| Part of a whole (≤ 5 parts)   | Donut + legend list with shares                                       | `DonutChart` (> 5 parts → bar list) |
| Intensity over two dimensions | Heatmap on the sequential ramp                                        | `Heatmap`                           |
| Exact values                  | Table view — every chart offers one (toggle or adjacent)              | `Table`                             |

Never: dual y-axes, pie with > 5 slices, rainbow scales, a number on every point.

## 4. Marks & anatomy

- Bars ≤ 24px thick, 4px rounded data end, square at the baseline, grow from one baseline.
- Lines 2px, round caps/joins. End-dot r = 4 with a 2px surface ring.
- Area = the series hue as a **vertical gradient wash** (`--chart-area-top` → 0), never a solid block.
- 2px surface gap between touching marks (donut arcs, stacked parts); never a stroke around a mark.
- Grid hairline 1px solid, recessive; y-axis may start above zero only with a visible note
  ("Sumbu Y dimulai 86%").
- Text never wears the data colour: values/labels use text tokens; identity is the swatch / line-key
  beside them. Legend for ≥ 2 series (line keys for lines, squares for fills); none for one series.
- Numbers: `id-ID` formatting via `src/lib/format-id.ts`; tabular figures only in columns.

## 5. Motion (immersion, never decoration)

| Moment        | Behaviour                                                                                                                                                                                                                                  | Budget                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| Entrance      | Once, when ≥ 30% of the chart is on screen (`useChartInView`). Bars grow from the baseline (≤ 40ms stagger), lines draw, areas rise, donut sweeps clockwise from 12 o'clock, heatmap cascades diagonally, Unovis series wipe left → right. | ≤ 900ms               |
| Data change   | Tween from the old value — bar width, path `d`, arc `d`, cell colour, Unovis `duration`. Never redraw from zero.                                                                                                                           | `--chart-tween` 480ms |
| Hover / focus | Crosshair + one tooltip for all series (line/area); the mark itself is the target on bars/cells; others dim to `--chart-dim`. Heatmap highlights the row and column labels.                                                                | 120–200ms             |
| Live          | The latest point of a sparkline breathes (a ring, 2.4s) — "this is today".                                                                                                                                                                 | ambient, opacity only |
| Scrub         | Production trend: hero readout follows the crosshair (animated number) and returns to today on leave.                                                                                                                                      | instant + 0.6s count  |

Reduced motion: `inView` is true at mount, every entrance and tween is off, data is final from the
first frame. Animations use transform / opacity / `d` / clip-path only.

## 6. Interaction & accessibility

- Tooltips enhance, never gate: every value is also in a label or the table view. Value first, series
  name second, line keys not boxes. Glass surface (`--chart-tooltip-bg` + blur), no pointer events.
- Hit targets ≥ 24px; heatmap cells and legend keys are focusable and show the same readout on focus.
- Legends toggle series (never the last visible one) and spotlight on hover/focus; colour follows
  the entity, so hiding a series never repaints the others.
- Every chart root has an accessible name (`role="img"` + summary, or `role="grid"` for heatmaps);
  the scrub readout is `aria-live="polite"`.
- Dark mode is selected, not flipped: its own steps, validated against the dark surface.

## 7. Layout

- Chart cards follow one anatomy: eyebrow → title → one-line insight (description) → controls in one
  row at the right (`CardAction`) → hero readout (optional) → plot → stats strip → legend + footnote.
- Plots size to their container (`useElementSize` / container queries), never a fixed width; donut
  legend switches beside/below at `@[27rem]`. No horizontal page scroll at 320px — wide heatmaps
  scroll inside a labelled region.

## 8. Checklist before a chart ships

1. Form matches the job (§3); no dual axis; ≤ 5 categorical series.
2. Colours only from §2 tokens; new categorical palette → run the validator in both modes.
3. Marks per §4; legend rule respected; text in text tokens.
4. Entrance via `useChartInView`, updates tween, reduced motion renders final state (`use-chart-inview.test.ts`).
5. Hover + keyboard readout; table view available.
6. Rendered and looked at in light and dark, 375px and 1280px (layout auditor: 0 blockers).
