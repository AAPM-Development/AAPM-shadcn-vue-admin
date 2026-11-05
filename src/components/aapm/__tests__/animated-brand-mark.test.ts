// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import AnimatedBrandMark from '../animated-brand-mark.vue'

describe('official animated product lockup', () => {
  it('renders the supplied SVG as one accessible image', () => {
    const wrapper = mount(AnimatedBrandMark, { props: { onDark: true, variant: 'erp-stacked' } })
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toBe('AAPM Cloud ERP')
    expect(wrapper.get('svg').attributes('viewBox')).toBe('0 0 70.14 28.76')
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })

  it('namespaces exported classes and IDs separately for every instance', () => {
    const wrapper = mount(defineComponent({
      render: () => h('div', [h(AnimatedBrandMark, { onDark: true }), h(AnimatedBrandMark, { onDark: false })]),
    }))
    const svgs = wrapper.findAll('svg')
    expect(svgs[0]!.attributes('id')).not.toBe(svgs[1]!.attributes('id'))
    expect(wrapper.findAll('style')[0]!.text()).not.toMatch(/\.cls-\d/)
    wrapper.unmount()
  })
})
