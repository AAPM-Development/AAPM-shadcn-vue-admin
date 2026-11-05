// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'

import horizontalWhite from '../../../../../public/brand/aapm-cloud-erp-horizontal-white.svg?raw'
import stackedWhite from '../../../../../public/brand/aapm-cloud-erp-stacked-white.svg?raw'
import { buildLockupMarkup } from '../brand-markup'
import { LOGO_GEOMETRY } from '../logo-geometry'

const parse = (markup: string) => new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement

describe.each([
  ['erp', horizontalWhite],
  ['erp-stacked', stackedWhite],
] as const)('lockup markup (%s)', (variant, master) => {
  const svg = parse(buildLockupMarkup(master, variant, 'p1'))
  const geo = LOGO_GEOMETRY[variant]

  it('never outlines the emblem: the only stroke is the sweep mask', () => {
    expect(svg.querySelectorAll('[data-logo-part="icon"] [stroke]')).toHaveLength(0)
    const stroked = [...svg.querySelectorAll('[stroke]')]
    expect(stroked).toHaveLength(1)
    expect(stroked[0]!.closest('mask')?.getAttribute('id')).toBe('p1-sweep')
  })

  it('tags every part the timeline animates', () => {
    for (const part of ['travel-x', 'travel-y', 'breath', 'nod', 'head'])
      expect(svg.querySelectorAll(`[data-logo-${part}]`), part).toHaveLength(1)
    expect(svg.querySelectorAll('[data-logo-letter]')).toHaveLength(geo.letters)
    expect(svg.querySelectorAll('[data-logo-glyph]')).toHaveLength(geo.glyphs)
    expect(svg.querySelector('[data-logo-ring]')?.getAttribute('mask')).toBe('url(#p1-sweep)')
    expect(svg.querySelector('[data-logo-part="main"]')?.getAttribute('clip-path')).toBe('url(#p1-clip-main)')
    expect(svg.querySelector('[data-logo-part="sub"]')?.getAttribute('clip-path')).toBe('url(#p1-clip-sub)')
  })

  it('renders the master artwork at rest when nothing animates', () => {
    const moved = [...svg.querySelectorAll('[style]')].filter(el => /(?:^|;)\s*transform\s*:/.test(el.getAttribute('style')!))
    expect(moved).toHaveLength(0)
    expect(svg.querySelectorAll('[transform]:not([data-logo-sweep])')).toHaveLength(0)
    expect(svg.querySelector('[data-logo-sweep]')?.getAttribute('stroke-dashoffset')).toBe('0')
  })

  it('keeps ids and classes unique per instance', () => {
    const other = parse(buildLockupMarkup(master, variant, 'p2'))
    expect(svg.getAttribute('id')).not.toBe(other.getAttribute('id'))
    expect(svg.querySelector('style')!.textContent).not.toMatch(/\.cls-\d/)
  })
})
