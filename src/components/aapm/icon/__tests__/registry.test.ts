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
