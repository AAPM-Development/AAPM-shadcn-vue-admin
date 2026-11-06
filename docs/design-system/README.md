# AAPM UI (Vue) — design system guide

This repository is the **AAPM Vue template**. A new internal AAPM app starts from a fork of it. The design-system layer is kept package-ready, so it can be extracted as `@aapm/ui-vue` once a second real consumer exists.

The brand layer follows **AAPM Ecosystem** (`AAPM_Ecosystem/docs/design-system`), which is the canonical source of the Brand Core, the Digital Extension, the status semantics and the icon semantics.

## Layers

The layers follow the Ecosystem model (Brand → Semantic → Components → Patterns → Template → Screens):

| Ecosystem layer        | Here                                                                                       | Notes                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Brand primitives       | `src/design-system/brand/aapm-brand.tokens.json` → `src/assets/tokens/brand.generated.css` | Vendored copy and generated CSS. Never edit either by hand.                                        |
| Theme derivation       | `src/assets/tokens/primitives.css`                                                         | Ramps and tints derived from the brand variables.                                                  |
| Semantic UI foundation | `src/assets/tokens/semantic.css`, `tones.css`, `src/design-system/states.ts`               | shadcn-vue token names stay intact; the state vocabulary lives here.                               |
| Components             | `src/components/ui/**` (stock shadcn-vue) + `src/components/aapm/**`                       | AAPM behaviour attaches through `data-slot`, tokens and plugins, never by editing `components/ui`. |
| Patterns and recipes   | `src/components/aapm/erp/**`, `src/components/aapm/charts/**`                              | B2–B4 add more patterns here.                                                                      |
| Motion                 | `src/assets/motion.css`, `src/assets/motion/**`, `src/plugins/motion/**`                   | All motion sits behind `prefers-reduced-motion: no-preference`.                                    |
| Template / screens     | `src/pages/**`, `src/layouts/**`                                                           | Product composition, owned by each app.                                                            |

## Brand tokens

```bash
pnpm tokens:sync --from D:/SA/AAPM_Ecosystem   # copy the canonical JSON, then regenerate the CSS
pnpm tokens:sync                               # regenerate from the vendored copy
```

- After syncing, update `src/design-system/brand/SOURCE.md` with the Ecosystem commit.
- `brand-tokens.test.ts` fails if the CSS is stale, if a reference doesn't resolve, or if a Brand Core or Digital hex is written as a literal in `src/**/*.{css,vue,ts}` outside the generated file (comments, tests and SVG assets excluded).

## Status semantics

Business states never map straight to colour:

```text
business value (doc.review) → semantic state (work.pending_decision) → tone (amber) → theme
```

- The vocabulary in `src/design-system/states.ts` holds the 30 Ecosystem states (data, freshness, work, history) plus two flagged AAPM extensions (`work.draft`, `work.in_progress`).
- `STATE_DOMAINS` in `tones.ts` maps business values onto it. A per-value tone override keeps each chip's approved colour.
- Categories (priority, label, role, plan) keep direct tones.
- To show a state, use `<StateChip :state>`.
- To show how fresh a data region is, use `<FreshnessIndicator :state :since>`.

## Capability matrix

- `src/design-system/capabilities.ts` is the single source for the 83 requirements: AAPM Ecosystem UI-*, ERP routes R01–R16 and ERP platform PC01–PC22.
- It is shown in `/ui-kit` → **Kapabilitas** and in `CAPABILITY_MATRIX.md`; run `pnpm capabilities:doc` after editing the registry.
- `ada` means a component meets the requirement and `/ui-kit` demos it.
- `sebagian` means something exists and the note names what is missing.
- `belum` means nothing yet.
- `milik-produk` means backend, operations or domain authority owns it.

## Lifecycle patterns

Readiness, decisions, corrections and history live in `src/components/aapm/work/`. They render data and emit intents; readiness, approval and posting always come from the server. Their contracts are typed in `src/design-system/contracts/lifecycle.ts`.

| Need                        | Component                                     | Rule                                                                                                                                |
| --------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Why an action can't run     | `ReasonedAction`                              | Uses `aria-disabled`, never `disabled`, so the reason stays focusable and readable (tooltip + `aria-describedby`).                  |
| Can this document move on?  | `ReadinessReview`, `BlockerList`              | `Readiness.result` maps to a semantic state; each blocker has a reason, a resolution and an optional `source` intent.               |
| Approve / return / reject   | `DecisionForm`                                | `submit` is a prop returning a promise, so the form owns pending, confirmation and the "Hasil belum pasti" (unknown outcome) state. |
| Change a posted value       | `CorrectionForm`                              | The original stays visible, only changed fields become `Revision`s, a reason is required, and ambiguous id-ID numbers are rejected. |
| What changed and who did it | `RevisionDiff`, `ActivityFeed`                | Append-only. A correction links to what it `corrects`. Entries carry `source` and `correlationId`.                                  |
| Long-running work           | `ProgressLog`                                 | Append-only; a fix is a new entry ("Koreksi atas"), never an edit.                                                                  |
| Acting for someone          | `ApprovalDelegation`                          | Shows "atas nama"; with no eligible approver it becomes a blocker.                                                                  |
| Feature off for this scope  | `FeatureGate`                                 | Names the scope (Sistem, Tenant, Perusahaan) and who can turn it on.                                                                |
| Record overview             | `KeyValueList`, `RelatedObjects`, `Entity360` | Empty values read "—"; an empty list reads "Belum ada data."                                                                        |

`/ui-kit` → **Siklus & keputusan** demos each one. **ERP** → **Koreksi penerimaan barang** (`#alur-koreksi`) chains them into one flow: readiness, a blocker resolved, a correction, an approval, then the revision in the history.

## Adding a component

1. Build it in `src/components/aapm/**`, using tokens and semantic states only, with no literal brand hex.
2. Demo it in a `/ui-kit` section with a `KitSection id="…"`.
3. Update its row in `capabilities.ts`: status, `components`, `demo`, and `note` if it is partial. Then run `pnpm capabilities:doc`.
4. Test it. `capabilities.test.ts` checks that the files and the demo anchor exist.

## Boundary rule

These folders form the design-system layer:

- `src/design-system/**`
- `src/components/aapm/**`
- `src/assets/tokens/**`
- `src/assets/motion/**`
- `src/lib/**`

Code in them must not import `@/pages`, `@/stores`, `@/router`, `@/services` or `@/layouts`, by alias or by relative path. `src/design-system/__tests__/boundary.test.ts` enforces this. A violation gets fixed by moving app logic out of the layer; it doesn't get added as an exception. For example, the HTTP client now lives in `src/services/api-client.ts`.
