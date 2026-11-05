# AAPM Admin — brand UI design

Status: approved direction (chat, 2026-11-05) · Scope: this fork only (internal app)

## Goal

Turn the `shadcn-vue-admin` fork into the AAPM internal admin: AAPM logo and colors,
a semantic icon set, and data visualizations for layer-farm operations — without
breaking the template's routing, layouts, theme system, or tests.

## Inputs (what is authoritative)

| Input             | Source                                                                                         | Use                                                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Logo masters      | `D:\SA\AAPM_Ecosystem\docs\design-system\brand\assets\aapm-{logo-horizontal,icon}{,-dark}.svg` | Copied untouched to `public/brand/`. Dark surfaces use the `-dark` file, never a CSS filter.                                                  |
| Brand Core        | same repo, `tokens/aapm-brand.tokens.json`                                                     | Green `#318139`, Orange `#D4451A`, White `#FFFFFF`, Dark-logo neutral `#CCCCCC`                                                               |
| Digital Extension | same file                                                                                      | Lime `#B4E717`, Lime soft `#C3EC45`, Deep green `#2C7433`, Warm canvas `#F6F5F2`, Green tint `#F2FCF3`, Soft surface `#EFF5EF`, Ink `#10191A` |
| Reference only    | `D:\SA\ASSET\AAPM Design System 0826`                                                          | Ideas (semantic icon registry, overline labels, lifecycle states). Not a constraint — user: "ga terpakai, referensi saja".                    |
| Company           | aapm.co.id                                                                                     | PT Agung Abadi Putra Mandiri, layer-poultry (egg) farm, Payakumbuh. Dashboard content is egg production.                                      |

User direction: light theme = **Soft Structural**, dark theme = **Dark Operator**, switchable with the
existing light/dark/system toggle. Internal app: no public-site storytelling, no governance work.

## Design decisions

- **Typeface:** Plus Jakarta Sans Variable (Indonesian-designed, Tokotype) for UI and display;
  JetBrains Mono Variable for codes and IDs. Self-hosted via `@fontsource-variable/*` (no font CDN).
  Display tracking −0.035em, overline 10–11px uppercase +0.16em. Tabular figures in tables and axes only.
- **Light — Soft Structural:** canvas warm `#F6F5F2`, raised surfaces `#FFFFFF`, hairline borders,
  green-tinted diffuse shadow, ink `#10191A`, primary `#318139`.
- **Dark — Dark Operator:** graphite canvas `#0E1113`, surface `#14181C`, white/8% hairlines,
  primary green lifted for contrast, lime `#B4E717` as the single signal accent (focus, active, live).
- **Radius:** control 12px, card 20px (concentric with 8px inner panels). Default `--radius` 0.75rem.
- **Motion:** 150 / 220 / 360ms with `cubic-bezier(.22,1,.36,1)` (out) and `cubic-bezier(.16,1,.3,1)`
  (emphasis). Page sections rise 8px + fade, staggered. Respect `prefers-reduced-motion`.
- **Icons:** semantic registry `<AapmIcon name="egg" />` → Solar (bold-duotone for objects, bold for
  status/actions) + Phosphor duotone for farm nouns Solar lacks. Compiled at build time with
  `unplugin-icons` (no Iconify API calls). Lucide stays inside `components/ui` primitives (chevrons,
  checks) at stroke 1.75.
- **Chart palette (validated with the dataviz validator, adjacent pairs):**
  - Light on `#FFFFFF`: `#318139` green · `#2593B8` teal · `#D4451A` orange · `#7B5CD6` violet · `#8CB80F` lime — all checks pass; lime < 3:1 → legend + tooltip + table view required.
  - Dark on `#14181C`: `#3DA654` · `#2D9BC0` · `#E0612D` · `#8B73E6` · `#7FA312` — all checks pass.
  - Sequential (heatmap): one green ramp. Status colors separate from series and always paired with icon + label.
  - Marks: 2px lines, area wash ≈10%, bars ≤ 24px with 4px rounded data end, 2px surface gaps, hairline grid, no gradients.
- **Copy:** Indonesian for user-facing sentences, English for nav/metric labels, Indonesian number
  format (`12.450 kg`, `92,4%`, `Rp 482,6 jt`). Sentence case. No emoji.

## Redesign audit (current fork)

| Area     | Finding                                                                             | Fix                                                                                                        |
| -------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Brand    | Satellite lucide logo, "Acme Inc / Evil Corp" teams, `shadcn-vue-admin` title       | AAPM mark + lockup, real AAPM workspaces, title/meta/favicons                                              |
| Type     | Default system/Inter stack, 400/700 only, no tracking                               | Plus Jakarta Sans, 500/600 weights, tracked display + overlines                                            |
| Color    | Neutral zinc, pure-white canvas, black-alpha shadows, 8 unrelated selectable themes | AAPM tokens (3 layers), warm canvas, green-tinted shadow; `aapm` default theme                             |
| Icons    | Lucide everywhere, hand-pasted SVG paths on KPI cards                               | Semantic `AapmIcon` registry                                                                               |
| Data viz | Gradient area fill, `Desktop/Mobile` visitors, `$` amounts, no table view           | Farm KPIs with sparklines/deltas, HDP trend vs standard, bullet, donut, heatmap, ranked bars, table toggle |
| Layout   | Equal 4-col cards + 4/3 split, generic header, disabled placeholder tabs            | Asymmetric bento, overline + title header, blurred sticky top bar                                          |
| Content  | "Olivia Martin", `$1,999.00`, "workspace description"                               | Indonesian farm names, Rupiah, real labels                                                                 |

## Non-goals

Indonesian locale for every existing page, real API wiring, Academy lockup usage, changing
`components/ui` behavior, publishing brand changes back to `AAPM_Ecosystem`.

## Revisions during execution (2026-11-05)

These supersede the matching decisions above.

1. **Icons → Lucide.** ERP `docs/UI_UX_REQUIREMENTS.md` UX-13 (canonical for AAPM UI delivery) mandates one Lucide vocabulary through a shared registry. The semantic registry stays (`<AapmIcon name="egg" />`); Solar/Phosphor and `unplugin-icons` were removed.
2. **Monochrome surfaces.** Canvas, cards, popovers, sidebar, borders and muted text use the template's original shadcn-vue neutral values (oklch, chroma 0) in light and dark. AAPM color appears only on primary actions, focus, active nav, status tags and data visualization. Warm canvas / green tints are not used.
3. **shadcn-vue primitives untouched.** `components/ui` (Card, Button, …) are stock; branding is applied only through CSS variable values. Default radius stays 0.5rem (store) / 0.625rem (`:root`).
4. **Bahasa Indonesia by default** for navigation and screens (UX-03/UX-09).
5. **Dashboard contract (UX-09/UX-12):** company, site, period, updated time and a "Data contoh" label are always visible; every KPI shows its source and a drilldown; the action queue lists owner and next action; the non-zero HD axis is stated; legends toggle series; the trend has a table view.
6. **Minimal UI:** no gradients/glows, no tiles around icons or the logo, flat hairline bento on the brand page, pastel status tags (≥ 4.5:1 text).
7. **`eyebrow` utility** replaces the custom `overline` utility, which collided with Tailwind's built-in `overline` (text-decoration).
