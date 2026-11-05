import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

import { renderBrandCss } from '../../../../scripts/sync-brand-tokens.mjs'

const ROOT = process.cwd()
const JSON_PATH = join(ROOT, 'src/design-system/brand/aapm-brand.tokens.json')
const GENERATED = join(ROOT, 'src/assets/tokens/brand.generated.css')
const json = JSON.parse(readFileSync(JSON_PATH, 'utf8'))
const css = renderBrandCss(json)
const primitives = readFileSync(join(ROOT, 'src/assets/tokens/primitives.css'), 'utf8')

/** Brand Core + Digital masters that may only live in the generated layer (spec §Testing). */
const MASTER_HEX = /#(?:318139|d4451a|b4e717|c3ec45|2c7433|f6f5f2|f2fcf3|eff5ef|10191a|cccccc)\b/gi

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      return entry.name === '__tests__' ? [] : sourceFiles(path)
    return /\.(?:css|vue|ts)$/.test(entry.name) && entry.name !== 'brand.generated.css' ? [path] : []
  })
}
function stripComments(text: string) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

describe('brand tokens (Ecosystem source → generated CSS)', () => {
  it('emits every brand value', () => {
    expect(css).toContain('--aapm-brand-core-green: #318139;')
    expect(css).toContain('--aapm-brand-core-neutral-dark-variant: #CCCCCC;')
    expect(css).toContain('--aapm-brand-digital-ink: #10191A;')
  })

  it('resolves semantic aliases to var() references', () => {
    expect(css).toContain('--aapm-brand-semantic-brand-primary: var(--aapm-brand-core-green);')
    expect(css).toContain('--aapm-brand-semantic-text-ink: var(--aapm-brand-digital-ink);')
  })

  it('the generated file is current', () => {
    expect(readFileSync(GENERATED, 'utf8')).toBe(css)
  })

  it('emits every $value of the vendored JSON under its variable', () => {
    const walk = (node: Record<string, any>, path: string[]): [string[], string][] => Object.entries(node).flatMap(([key, child]) => {
      if (key.startsWith('$') || (path.length === 0 && (key === 'meta' || key === 'notes')) || typeof child !== 'object' || child === null)
        return []
      return '$value' in child ? [[[...path, key], String(child.$value)]] : walk(child, [...path, key])
    })
    const leaves = walk(json, [])
    expect(leaves.length).toBe(21)
    const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
    const name = (p: string[]) => `--aapm-brand-${(p[0] === 'brand' ? p.slice(1) : p).map(kebab).join('-')}`
    for (const [path, value] of leaves) {
      const ref = /^\{([^}]+)\}$/.exec(value)
      expect(css, path.join('.')).toContain(`${name(path)}: ${ref ? `var(${name(ref[1]!.split('.'))})` : value};`)
    }
  })

  it('inherits a group-level $type and types an alias from its target (DTCG)', () => {
    const out = renderBrandCss({
      brand: { core: { green: { $type: 'color', $value: '#318139' } } },
      semantic: { status: { $type: 'color', success: { $value: '#1a7a43' } }, alias: { $value: '{brand.core.green}' } },
    })
    expect(out).toContain('--aapm-brand-semantic-status-success: #1a7a43;')
    expect(out).toContain('--aapm-brand-semantic-alias: var(--aapm-brand-core-green);')
  })

  it('accepts --from=<path> and rejects unknown arguments', () => {
    const before = readFileSync(GENERATED, 'utf8')
    const eq = spawnSync(process.execPath, ['scripts/sync-brand-tokens.mjs', '--from=Z:/nope'], { cwd: ROOT, encoding: 'utf8' })
    expect(eq.status).not.toBe(0)
    expect(eq.stderr).toContain('Z:/nope')
    const typo = spawnSync(process.execPath, ['scripts/sync-brand-tokens.mjs', '--form', 'D:/x'], { cwd: ROOT, encoding: 'utf8' })
    expect(typo.status).not.toBe(0)
    expect(typo.stderr).toContain('--form')
    expect(readFileSync(GENERATED, 'utf8')).toBe(before)
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
    const run = spawnSync(process.execPath, ['scripts/sync-brand-tokens.mjs', '--from', 'Z:/nope'], { cwd: ROOT, encoding: 'utf8' })
    expect(run.status).not.toBe(0)
    expect(run.stderr).toContain('Z:/nope')
    expect(readFileSync(GENERATED, 'utf8')).toBe(before)
  })

  it('primitives take master values from the generated layer', () => {
    expect(primitives).toMatch(/--aapm-core-green:\s*var\(--aapm-brand-core-green\)/)
    expect(primitives).toMatch(/--aapm-green-600:\s*var\(--aapm-brand-core-green\)/)
    expect(primitives).toMatch(/--aapm-lime-500:\s*var\(--aapm-brand-digital-lime\)/)
  })

  it('no brand master hex is written literally outside the allowed files', () => {
    const offenders = sourceFiles(join(ROOT, 'src')).flatMap((file) => {
      const hits = stripComments(readFileSync(file, 'utf8')).match(MASTER_HEX) ?? []
      return hits.map(hex => `${relative(ROOT, file).replaceAll('\\', '/')}: ${hex}`)
    })
    expect(offenders).toEqual([])
  })
})
