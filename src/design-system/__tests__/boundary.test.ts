import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Package-ready boundary (B1 spec): the design-system layer never imports app code, so it can
 * later be extracted as @aapm/ui-vue without untangling pages, stores or routing.
 */
const ROOT = process.cwd()
const LAYER = ['src/design-system', 'src/components/aapm', 'src/assets/tokens', 'src/assets/motion', 'src/lib']
const FORBIDDEN = /^@\/(?:pages|stores|router|services|layouts)(?:\/|$)|^(?:\.\.\/)+(?:pages|stores|router|services|layouts)(?:\/|$)/
/** file → reason. Starts empty: violations are fixed, not listed. */
const EXCEPTIONS: Record<string, string> = {}

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      return entry.name === '__tests__' ? [] : files(path)
    return /\.(?:ts|vue|css)$/.test(entry.name) ? [path] : []
  })
}

/** Static `import … from`, `export … from`, side-effect `import '…'`, dynamic `import('…')` and CSS `@import '…'`. */
const SPECIFIER = /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|@import\s+)['"]([^'"]+)['"]/g

describe('design-system import boundary', () => {
  it('scans the whole layer', () => {
    expect(LAYER.flatMap(dir => files(join(ROOT, dir))).length).toBeGreaterThan(50)
  })

  it('the design-system layer never imports app code', () => {
    const offenders = LAYER.flatMap(dir => files(join(ROOT, dir))).flatMap((file) => {
      const rel = relative(ROOT, file).replaceAll('\\', '/')
      return [...readFileSync(file, 'utf8').matchAll(SPECIFIER)]
        .map(m => m[1]!)
        .filter(spec => FORBIDDEN.test(spec))
        .map(spec => `${rel} → ${spec}`)
    })
    expect(offenders.filter(o => !(o.split(' → ')[0]! in EXCEPTIONS))).toEqual([])
  })

  it('catches the forms it is meant to catch', () => {
    for (const bad of ['@/pages/dashboard/data/farm-overview', '@/stores/auth', '../../router', '../layouts/default.vue'])
      expect(FORBIDDEN.test(bad), bad).toBe(true)
    for (const ok of ['@/lib/utils', '@/components/ui/button', './pages-like', '@/design-system/states'])
      expect(FORBIDDEN.test(ok), ok).toBe(false)
  })
})
