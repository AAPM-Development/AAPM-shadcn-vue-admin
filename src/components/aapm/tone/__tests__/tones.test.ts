// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import type { StateDomain, ToneDomain } from '../tones'

import ToneChip from '../tone-chip.vue'
import { semanticOf, STATE_DOMAINS, TONE_MAP, toneOf, TONES } from '../tones'

const css = readFileSync(resolve(__dirname, '../../../../assets/tokens/tones.css'), 'utf8')

describe('tones', () => {
  it('every domain value maps to a tone', () => {
    for (const map of Object.values(TONE_MAP)) {
      for (const tone of Object.values(map))
        expect(TONES).toContain(tone)
    }
  })

  it('unknown values fall back to neutral', () => {
    expect(toneOf('task', 'done')).toBe('green')
    expect(toneOf('task', 'nonsense')).toBe('neutral')
    expect(toneOf('billing', undefined)).toBe('neutral')
    expect(toneOf('user', 'constructor')).toBe('neutral') // no prototype leaks
  })

  it('tones.css defines all four variables per tone, light and dark', () => {
    const [light, dark] = css.split('.dark {')
    for (const tone of TONES) {
      for (const key of ['bg', 'fg', 'border', 'dot']) {
        expect(light).toContain(`--tone-${tone}-${key}:`)
        expect(dark).toContain(`--tone-${tone}-${key}:`)
      }
      expect(css).toContain(`[data-tone='${tone}']`)
    }
  })

  it('records the measured contrast for every tone (text ≥ 4.5, dot ≥ 3)', () => {
    const ratios = [...css.matchAll(/text ([\d.]+):1 · dot ([\d.]+):1/g)]
    expect(ratios).toHaveLength(TONES.length * 2)
    for (const [, text, dot] of ratios) {
      expect(Number(text)).toBeGreaterThanOrEqual(4.5)
      expect(Number(dot)).toBeGreaterThanOrEqual(3)
    }
  })

  it('chip always carries text plus an icon or a dot', () => {
    const withDot = mount(ToneChip, { props: { tone: 'green' }, slots: { default: 'Lunas' } })
    expect(withDot.attributes('data-tone')).toBe('green')
    expect(withDot.find('.aapm-tone-chip__dot').exists()).toBe(true)
    expect(withDot.text()).toBe('Lunas')

    const withIcon = mount(ToneChip, { props: { tone: 'red', icon: 'danger' }, slots: { default: 'Ditolak' } })
    expect(withIcon.find('svg').exists()).toBe(true)
    expect(withIcon.find('.aapm-tone-chip__dot').exists()).toBe(false)
  })
})

/** Today's approved chip colours, copied verbatim from TONE_MAP before the semantic layer (B1 Task 3). */
const TODAY = {
  doc: { draft: 'neutral', submitted: 'blue', review: 'amber', verified: 'teal', posted: 'green', paid: 'green', rejected: 'red', reversed: 'violet', locked: 'neutral' },
  task: { 'backlog': 'neutral', 'todo': 'blue', 'in progress': 'amber', 'done': 'green', 'canceled': 'red' },
  priority: { low: 'blue', medium: 'amber', high: 'orange' },
  label: { bug: 'red', feature: 'violet', documentation: 'teal' },
  user: { active: 'green', inactive: 'neutral', invited: 'blue', suspended: 'red' },
  role: { superadmin: 'violet', admin: 'blue', manager: 'teal', cashier: 'amber' },
  billing: { paid: 'green', unpaid: 'amber', overdue: 'red', cancelled: 'neutral' },
  plan: { 'basic': 'neutral', 'Free': 'neutral', 'Small Business': 'blue', 'Enterprise': 'violet' },
  order: { draft: 'neutral', shipped: 'blue', paid: 'green', due: 'amber' },
  severity: { danger: 'red', warning: 'amber', info: 'blue', success: 'green' },
  session: { current: 'green', active: 'teal', expired: 'neutral', revoked: 'red' },
} as const

describe('business → semantic → tone', () => {
  it('repaints no chip', () => {
    for (const [domain, values] of Object.entries(TODAY)) {
      for (const [value, tone] of Object.entries(values))
        expect(toneOf(domain as ToneDomain, value), `${domain}.${value}`).toBe(tone)
    }
    expect(Object.keys(TONE_MAP).sort()).toEqual(Object.keys(TODAY).sort())
  })

  it('resolves every state-domain value to a semantic state', () => {
    for (const domain of Object.keys(STATE_DOMAINS) as StateDomain[]) {
      for (const value of Object.keys(STATE_DOMAINS[domain]))
        expect(semanticOf(domain, value), `${domain}.${value}`).not.toBeNull()
    }
    expect(semanticOf('doc', 'review')).toBe('work.pending_decision')
    expect(semanticOf('doc', 'reversed')).toBe('history.invalidated')
    expect(semanticOf('task', 'canceled')).toBe('history.withdrawn')
    expect(semanticOf('order', 'shipped')).toBe('work.in_progress')
    expect(semanticOf('doc', 'unknown')).toBeNull()
    expect(semanticOf('doc', undefined)).toBeNull()
  })

  it('state domains cover exactly doc, task, billing and order', () => {
    expect(Object.keys(STATE_DOMAINS).sort()).toEqual(['billing', 'doc', 'order', 'task'])
  })
})
