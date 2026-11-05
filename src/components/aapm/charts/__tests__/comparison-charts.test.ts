// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import RadialGauge from '../radial-gauge.vue'
import SmallMultiples from '../small-multiples.vue'

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', undefined)
})
afterEach(() => vi.unstubAllGlobals())

describe('radial gauge', () => {
  it('announces the actual, unit, target and scale without relying on colour', () => {
    const wrapper = mount(RadialGauge, { props: { label: 'HD', value: 92.4, target: 93 } })
    expect(wrapper.get('figure').attributes('aria-label')).toContain('92,4 %; target 93,0 %')
    expect(wrapper.text()).toContain('Skala 0,0–100,0 %')
    expect(wrapper.find('[data-aapm-gauge-target]').exists()).toBe(true)
    wrapper.unmount()
  })

  it.each([null, Number.NaN, Number.POSITIVE_INFINITY])('shows unavailable data for %s', (value) => {
    const wrapper = mount(RadialGauge, { props: { label: 'HD', value } })
    expect(wrapper.text()).toContain('Belum ada data')
    expect(wrapper.find('[data-aapm-gauge-fill]').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('NaN')
    wrapper.unmount()
  })

  it('clamps the arc while retaining an over-range actual in the readout', async () => {
    const wrapper = mount(RadialGauge, { props: { label: 'HD', value: 120 } })
    expect(wrapper.get('[data-aapm-gauge-fill]').attributes('stroke-dasharray')).toBe('100 100')
    expect(wrapper.text()).toContain('120,0')
    await wrapper.setProps({ value: 0 })
    expect(wrapper.find('[data-aapm-gauge-fill]').exists()).toBe(false)
    expect(wrapper.text()).toContain('0,0')
    wrapper.unmount()
  })

  it('handles an invalid range without invalid SVG coordinates', () => {
    const wrapper = mount(RadialGauge, { props: { label: 'HD', value: 50, min: 100, max: 100, target: 93 } })
    expect(wrapper.text()).toContain('Rentang skala belum valid')
    expect(wrapper.find('[data-aapm-gauge-target]').exists()).toBe(false)
    expect(wrapper.html()).not.toMatch(/NaN|Infinity/)
    wrapper.unmount()
  })
})

describe('small multiples', () => {
  const items = [
    { id: 'A1', label: 'Kandang A1', values: [90, 91, 92] },
    { id: 'A2', label: 'Kandang A2', values: [90, 89, 88] },
  ]
  const props = { items, labels: ['Sen', 'Sel', 'Rab'], label: 'HD kandang', target: 93 }

  it('uses the same coordinates for the same observation in different series', () => {
    const wrapper = mount(SmallMultiples, { props })
    const paths = wrapper.findAll('svg path').map(path => path.attributes('d'))
    expect(paths[0]!.split('L')[0]).toBe(paths[1]!.split('L')[0])
    expect(paths[0]).not.toBe(paths[1])
    expect(wrapper.text()).toContain('Skala bersama')
    expect(wrapper.findAll('tbody tr')).toHaveLength(3)
    wrapper.unmount()
  })

  it('synchronizes keyboard reading across all houses and clamps the boundaries', async () => {
    const wrapper = mount(SmallMultiples, { props })
    const button = wrapper.get('button')
    await button.trigger('keydown', { key: 'Home' })
    expect(wrapper.findAll('button').every(item => item.attributes('aria-label')!.includes('Sen: 90,0 %'))).toBe(true)
    await button.trigger('keydown', { key: 'ArrowLeft' })
    expect(button.attributes('aria-label')).toContain('Sen:')
    await button.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.findAll('button')[1]!.attributes('aria-label')).toContain('Sel: 89,0 %')
    await button.trigger('keydown', { key: 'End' })
    await button.trigger('keydown', { key: 'ArrowRight' })
    expect(button.attributes('aria-label')).toContain('Rab: 92,0 %')
    wrapper.unmount()
  })

  it('leaves a gap for missing readings and supports one-point and empty series', async () => {
    const wrapper = mount(SmallMultiples, { props: { ...props, items: [{ id: 'A1', label: 'A1', values: [90, null, 92] }] } })
    expect(wrapper.get('svg path').attributes('d')!.match(/M/g)).toHaveLength(2)
    expect(wrapper.get('svg path').attributes('d')).not.toContain('L')
    await wrapper.get('button').trigger('keydown', { key: 'Home' })
    await wrapper.get('button').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.get('button').attributes('aria-label')).toContain('Belum ada data')
    await wrapper.setProps({ items: [{ id: 'A1', label: 'A1', values: [0] }], labels: ['Sen'], target: undefined })
    expect(wrapper.html()).not.toMatch(/NaN|Infinity/)
    expect(wrapper.find('circle').exists()).toBe(true)
    await wrapper.setProps({ items: [] })
    expect(wrapper.text()).toContain('Belum ada seri')
    expect(wrapper.find('button').exists()).toBe(false)
    wrapper.unmount()
  })
})
