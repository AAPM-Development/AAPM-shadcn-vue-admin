#!/usr/bin/env node
/**
 * AAPM brand token sync (B1 foundation).
 *
 *   node scripts/sync-brand-tokens.mjs                       regenerate the CSS from the vendored JSON
 *   node scripts/sync-brand-tokens.mjs --from <ecosystem>    copy the canonical JSON first, then regenerate
 *
 * Source contract: AAPM_Ecosystem docs/design-system/brand/tokens/aapm-brand.tokens.json (DTCG).
 * Every colour token becomes `--aapm-brand-<kebab path>`; `{a.b.c}` references become
 * `var(--aapm-brand-a-b-c)`. Nothing is written unless the whole file renders.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const VENDORED_JSON = join(ROOT, 'src/design-system/brand/aapm-brand.tokens.json')
export const GENERATED_CSS = join(ROOT, 'src/assets/tokens/brand.generated.css')
const ECOSYSTEM_JSON = 'docs/design-system/brand/tokens/aapm-brand.tokens.json'
const SKIP = new Set(['meta', 'notes'])

const kebab = segment => segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
/** The top-level `brand` group is the namespace itself: brand.core.green → --aapm-brand-core-green. */
const varName = path => `--aapm-brand-${(path[0] === 'brand' ? path.slice(1) : path).map(kebab).join('-')}`

/**
 * Collect `{ path, value, type }` for every token (an object carrying `$value`), depth-first in
 * file order. `$type` is inherited from the nearest group that declares it (DTCG).
 */
function collect(node, path, inherited, out) {
  const groupType = node.$type ?? inherited
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$') || (path.length === 0 && SKIP.has(key)) || child === null || typeof child !== 'object')
      continue
    if ('$value' in child)
      out.push({ path: [...path, key], value: String(child.$value), type: child.$type ?? groupType })
    else
      collect(child, [...path, key], groupType, out)
  }
  return out
}

/** Render the DTCG brand tokens as one `:root` block of CSS custom properties. */
export function renderBrandCss(tokens) {
  const entries = collect(tokens, [], undefined, [])
  const byPath = new Map(entries.map(e => [e.path.join('.'), e]))
  // An alias without its own $type takes the type of the token it references (DTCG).
  const typeOf = (entry, seen = new Set()) => {
    if (entry.type)
      return entry.type
    const ref = /^\{([^}]+)\}$/.exec(entry.value)
    const target = ref && byPath.get(ref[1])
    if (!target || seen.has(target))
      return undefined
    seen.add(entry)
    return typeOf(target, seen)
  }
  const lines = entries.map((entry) => {
    const { path, value } = entry
    const ref = /^\{([^}]+)\}$/.exec(value)
    if (ref && !byPath.has(ref[1]))
      throw new Error(`unresolved reference {${ref[1]}} in ${path.join('.')}`)
    if (typeOf(entry) !== 'color')
      throw new Error(`non-colour token ${path.join('.')} ($type: ${typeOf(entry)})`)
    return `  ${varName(path)}: ${ref ? `var(${varName(ref[1].split('.'))})` : value};`
  })
  return [
    '/* Generated from src/design-system/brand/aapm-brand.tokens.json by `pnpm tokens:sync` — do not edit.',
    ' * Source of truth: AAPM_Ecosystem docs/design-system/brand (see src/design-system/brand/SOURCE.md). */',
    ':root {',
    ...lines,
    '}',
    '',
  ].join('\n')
}

/** `--from <root>` or `--from=<root>`; anything else is an error, never silently ignored. */
function parseArgs(argv) {
  const args = { from: undefined }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--from') {
      args.from = argv[++i] ?? ''
    }
    else if (arg.startsWith('--from=')) {
      args.from = arg.slice('--from='.length)
    }
    else {
      throw new Error(`unknown argument ${arg} (usage: tokens:sync [--from <ecosystem-root>])`)
    }
  }
  return args
}

function main(argv) {
  const { from: root } = parseArgs(argv)
  if (root !== undefined) {
    const source = root ? join(root, ECOSYSTEM_JSON) : ''
    if (!root || !existsSync(source)) {
      process.stderr.write(`tokens:sync: canonical token file not found under --from ${root || '(missing)'} (expected ${ECOSYSTEM_JSON})
`)
      return 1
    }
    // Render first, so a broken upstream file never replaces the vendored copy or the CSS.
    const css = renderBrandCss(JSON.parse(readFileSync(source, 'utf8')))
    copyFileSync(source, VENDORED_JSON)
    writeFileSync(GENERATED_CSS, css)
    process.stdout.write(`tokens:sync: copied ${source} and wrote ${GENERATED_CSS}
`)
    return 0
  }
  writeFileSync(GENERATED_CSS, renderBrandCss(JSON.parse(readFileSync(VENDORED_JSON, 'utf8'))))
  process.stdout.write(`tokens:sync: wrote ${GENERATED_CSS}\n`)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    process.exitCode = main(process.argv.slice(2))
  }
  catch (error) {
    process.stderr.write(`tokens:sync: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
