# Livestock & farm icon attribution

Vendored SVGs used by `registry.ts` (group `farm`, plus `erpProduction` / `erpCornDrying`).
Generated verbatim from `https://i.allsvgicons.com/r/<id>.json` (retrieved 2026-11-05); the only
change is stroke width on outline sets (1.5 → 1.75, to sit next to Lucide). Colour is always
`currentColor`. Licences confirmed via the Iconify collections API.

| Registry name(s)           | Source (Iconify id)                                      | Licence   | Author                                  |
| -------------------------- | -------------------------------------------------------- | --------- | --------------------------------------- |
| `flock`, `mortality`       | healthicons `zoonoses/animal-chicken` (`./chicken.ts`)   | MIT       | Health Icons — Resolve to Save Lives    |
| `hen`                      | `healthicons:animal-chicken-outline`                     | MIT       | Health Icons — Resolve to Save Lives    |
| `chicken`, `chickenFilled` | `fluent-emoji-high-contrast:chicken`                     | MIT       | Microsoft Corporation — Fluent UI Emoji |
| `chick`, `doc`             | `fluent-emoji-high-contrast:baby-chick`                  | MIT       | Microsoft Corporation — Fluent UI Emoji |
| `hatching`                 | `fluent-emoji-high-contrast:hatching-chick`              | MIT       | Microsoft Corporation — Fluent UI Emoji |
| `egg`, `eggs`              | `andrsrxn:eggs`                                          | MIT       | Andrés Raxón                            |
| `eggTray`, `erpProduction` | `iconoven:egg-tray`                                      | MIT       | Appic Marketing — iconoven.com          |
| `corn`, `erpCornDrying`    | `iconoven:corn-cob`                                      | MIT       | Appic Marketing — iconoven.com          |
| `coop`                     | `iconoven:chicken-coop`                                  | MIT       | Appic Marketing — iconoven.com          |
| `barn`, `farmSite`         | `si:barn-line`                                           | MIT       | Abhimanyu Rana — Sargam Icons           |
| `vaccine`                  | `covid:vaccine-protection-virus`                         | CC BY 4.0 | Streamline — streamlinehq.com           |
| `growth`                   | `streamline-sharp:decent-work-and-economic-growth-remix` | CC BY 4.0 | Streamline — streamlinehq.com           |

**CC BY 4.0 notice:** "Vaccine protection virus" and "Decent work and economic growth" icons by
Streamline (https://www.streamlinehq.com), licensed under CC BY 4.0
(https://creativecommons.org/licenses/by/4.0/). Not modified except stroke width.

**Not used:** `wordpress:shipping` (GPL-2.0-or-later — incompatible with vendoring into this MIT
project); `shipping` uses Lucide `truck` (ISC).
