# Brand token source

`aapm-brand.tokens.json` in this folder is a **vendored copy** of the canonical AAPM brand tokens. It is never edited by hand.

|                  |                                                                         |
| ---------------- | ----------------------------------------------------------------------- |
| Canonical file   | `AAPM_Ecosystem/docs/design-system/brand/tokens/aapm-brand.tokens.json` |
| Vendored from    | Ecosystem commit `a75b57d`, token file version `1.1.0`, on 2026-11-05   |
| Generated output | `src/assets/tokens/brand.generated.css` (`--aapm-brand-*` variables)    |

## Update procedure

```bash
pnpm tokens:sync --from D:/SA/AAPM_Ecosystem
```

The command copies the canonical JSON and regenerates the CSS. It writes nothing if the path is wrong or any token fails to resolve. Afterwards, update the commit and date above, then run the tests: `src/assets/tokens/__tests__/brand-tokens.test.ts` fails if the CSS and the JSON disagree.

To regenerate the CSS from the copy already here, run plain `pnpm tokens:sync`.

Brand Core values (`brand.core.*`) belong to the Ecosystem. Changing them is an ecosystem-level change, not a change to this template.
