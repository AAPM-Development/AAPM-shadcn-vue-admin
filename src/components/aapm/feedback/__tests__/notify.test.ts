import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { notify } from '../notify'

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

vi.mock('vue-sonner', () => ({ toast }))

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')
const TOAST_CSS = read('src/assets/motion/toast.css')
const BRAND_CSS = read('src/assets/tokens/brand.generated.css')
const PRIMITIVES_CSS = read('src/assets/tokens/primitives.css')
const SEMANTIC_CSS = read('src/assets/tokens/semantic.css')

/** Declarations of one custom property in a CSS chunk, e.g. `--danger-fill: var(--x);` → `var(--x)` */
function declared(css: string, name: string): string | undefined {
  return new RegExp(`(?<![\\w-])${name}:([^;]+);`).exec(css)?.[1]?.trim()
}

/** Resolves `var(--token)` chains through the semantic light scope, the primitives and the generated brand layer down to a hex colour */
function resolveHex(value: string): string {
  const lightScope = SEMANTIC_CSS.split('.dark')[0]!
  let current = value
  for (let depth = 0; depth < 5; depth++) {
    const ref = /^var\((--[\w-]+)\)$/.exec(current)
    if (!ref)
      break
    current = declared(PRIMITIVES_CSS, ref[1]!) ?? declared(BRAND_CSS, ref[1]!) ?? declared(lightScope, ref[1]!) ?? current
  }
  expect(current, `${value} resolves to a hex colour`).toMatch(/^#[0-9a-f]{6}$/i)
  return current
}

/** WCAG 2.x relative luminance */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

describe('notify (toast v2)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('blocking uses the error channel with the blocking class', () => {
    notify.blocking('Aksi diblokir', { description: 'Periode sudah dikunci.' })

    expect(toast.error).toHaveBeenCalledTimes(1)
    const [title, opts] = toast.error.mock.calls[0]!
    expect(title).toBe('Aksi diblokir')
    expect(opts.class).toContain('aapm-toast')
    expect(opts.class).toContain('aapm-toast--blocking')
    expect(opts.duration).toBe(6000)
    expect(opts.description).toBe('Periode sudah dikunci.')
    expect(opts.style['--aapm-toast-duration']).toBe('6000ms')
  })

  it('success / info / warning call their channel', () => {
    for (const type of ['success', 'info', 'warning'] as const) {
      notify[type]('Tersimpan', { class: 'extra' })

      expect(toast[type]).toHaveBeenCalledTimes(1)
      const [title, opts] = toast[type].mock.calls[0]!
      expect(title).toBe('Tersimpan')
      expect(opts.class).toContain('aapm-toast')
      expect(opts.class).toContain(`aapm-toast--${type}`)
      expect(opts.class).toContain('extra')
    }
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('styles every sonner data-type', () => {
    for (const type of ['success', 'info', 'warning', 'error'])
      expect(TOAST_CSS, type).toContain(`[data-type='${type}']`)

    // every moving rule lives behind the reduced-motion query
    const [staticPart, ...motionParts] = TOAST_CSS.split('@media (prefers-reduced-motion: no-preference)')
    expect(motionParts.length).toBeGreaterThan(0)
    expect(staticPart).not.toMatch(/\b(?:animation|transition)\s*:/)
    expect(TOAST_CSS).toContain('aapm-shake-x')
    expect(TOAST_CSS).toContain('--aapm-toast-duration')
  })

  it('error toast text passes contrast', () => {
    const white = resolveHex('var(--aapm-core-white)')
    expect(white.toLowerCase()).toBe('#ffffff')

    // light theme: the solid toast sits on --danger-fill
    expect(declared(TOAST_CSS, '--aapm-toast-solid')).toBe('var(--danger-fill)')
    const lightFill = resolveHex(declared(SEMANTIC_CSS.split('.dark')[0]!, '--danger-fill')!)
    expect(contrast(lightFill, white)).toBeGreaterThanOrEqual(4.5)

    // dark theme: --danger-fill is a bright red there, so the toast picks its own darker step
    const darkOverride = /\.dark[^{]*\{[^}]*--aapm-toast-solid:([^;]+);/.exec(TOAST_CSS)?.[1]?.trim()
    expect(darkOverride, 'dark override of --aapm-toast-solid').toBeDefined()
    expect(contrast(resolveHex(darkOverride!), white)).toBeGreaterThanOrEqual(4.5)
  })
})
