// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import Sparkline from '../sparkline.vue'

beforeEach(() => vi.stubGlobal('IntersectionObserver', undefined))
afterEach(() => vi.unstubAllGlobals())

it('does not invent a comparison period for a regular time series', () => {
  const wrapper = mount(Sparkline, { props: { values: [89, 90, 92, 91, 93], label: 'HD 5 hari' } })
  expect(wrapper.get('[role="img"]').attributes('aria-label')).toBe('HD 5 hari')
  expect(wrapper.find('clipPath').exists()).toBe(false)
  expect(wrapper.find('[data-aapm-current]').exists()).toBe(false)
  wrapper.unmount()
})

it('supports an explicit comparison without changing its line weight', () => {
  const wrapper = mount(Sparkline, { props: { values: [89, 90, 92, 91, 93], current: 2 } })
  expect(wrapper.get('[data-aapm-current]').attributes('stroke-width')).toBe('2')
  wrapper.unmount()
})
