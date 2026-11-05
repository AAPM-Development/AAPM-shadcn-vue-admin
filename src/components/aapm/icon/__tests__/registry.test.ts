// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AapmIcon from '../AapmIcon.vue'
import { ICON_NAMES, ICONS } from '../registry'

describe('icon registry', () => {
  it('maps every semantic name to a component', () => {
    expect(ICON_NAMES.length).toBeGreaterThan(60)
    for (const name of ICON_NAMES)
      expect(ICONS[name], name).toBeTruthy()
  })

  it('covers the farm domain nouns the dashboard needs', () => {
    for (const name of ['egg', 'flock', 'feed', 'mortality', 'house', 'water', 'temperature', 'vaccine', 'production', 'fcr'] as const)
      expect(ICON_NAMES).toContain(name)
  })
})

describe('farm semantic map (ERP UI_KIT_RESEARCH, 2026-11-05)', () => {
  it('uses the Health Icons live chicken for flock and mortality', () => {
    // `chicken` (general) moved to the user's pick, fluent-emoji chicken (2026-11-05); the flock /
    // mortality metrics keep the ERP research decision.
    for (const name of ['flock', 'mortality'] as const) {
      const svg = mount(AapmIcon, { props: { name } }).find('svg')
      expect(svg.attributes('viewBox'), name).toBe('0 0 48 48')
      expect(svg.attributes('data-source'), name).toBe('healthicons:zoonoses/animal-chicken')
    }
  })

  it('maps kandang to Warehouse and humidity/observation to their Lucide glyphs', () => {
    expect(mount(AapmIcon, { props: { name: 'house' } }).find('svg').classes()).toContain('lucide-warehouse')
    expect(mount(AapmIcon, { props: { name: 'humidity' } }).find('svg').classes()).toContain('lucide-droplets')
    expect(mount(AapmIcon, { props: { name: 'observation' } }).find('svg').classes()).toContain('lucide-clipboard-check')
  })
})

describe('aapmIcon', () => {
  it('is hidden from assistive tech when decorative', () => {
    const wrapper = mount(AapmIcon, { props: { name: 'egg' } })
    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('exposes an accessible name when labelled', () => {
    const wrapper = mount(AapmIcon, { props: { name: 'egg', label: 'Telur' } })
    const svg = wrapper.find('svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toBe('Telur')
  })

  it('applies a numeric size as pixels', () => {
    const wrapper = mount(AapmIcon, { props: { name: 'dashboard', size: 18 } })
    expect(wrapper.find('svg').attributes('width')).toBe('18')
  })
})

describe('layer-farm set (allsvgicons, user request 2026-11-05)', () => {
  it.each(['chicken', 'egg', 'eggTray', 'eggs', 'coop', 'hen', 'chick', 'doc', 'hatching', 'barn', 'vaccine', 'growth'] as const)('%s renders a vendored svg with provenance', (name) => {
    const svg = mount(AapmIcon, { props: { name } }).find('svg')
    expect(svg.classes()).toContain('aapm-livestock')
    expect(svg.attributes('data-source')).toMatch(/^[a-z-]+:[a-z-]+/)
    expect(svg.element.innerHTML).not.toMatch(/#[0-9a-f]{3,6}/i) // currentColor only
  })

  it('shipping uses Lucide truck, not the GPL wordpress glyph', () => {
    expect(mount(AapmIcon, { props: { name: 'shipping' } }).find('svg').classes()).toContain('lucide-truck')
  })
})

describe('user icon picks (2026-11-05)', () => {
  it.each([
    ['chicken', 'fluent-emoji-high-contrast:chicken'],
    ['hen', 'healthicons:animal-chicken-outline'],
    ['doc', 'fluent-emoji-high-contrast:baby-chick'],
    ['barn', 'si:barn-line'],
    ['egg', 'andrsrxn:eggs'],
    ['coop', 'iconoven:chicken-coop'],
  ] as const)('%s → %s', (name, source) => {
    expect(mount(AapmIcon, { props: { name } }).find('svg').attributes('data-source')).toBe(source)
  })

  it('has one icon per ERP module', () => {
    const modules = ICON_NAMES.filter(n => n.startsWith('erp'))
    expect(modules).toHaveLength(29)
  })
})
