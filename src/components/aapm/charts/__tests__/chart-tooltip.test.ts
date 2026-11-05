// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import ChartTooltip from '../chart-tooltip.vue'

vi.mock('@vueuse/core', async () => {
  const { ref } = await import('vue')
  return {
    useElementBounding: () => ({ width: ref(160), height: ref(70) }),
    useWindowSize: () => ({ width: ref(375) }),
  }
})

describe('chart callout collision handling', () => {
  it('keeps the full callout inside either phone edge', async () => {
    const wrapper = mount(ChartTooltip, { props: { x: 0, y: 200, visible: true } })
    expect(wrapper.get('[role="status"]').attributes('style')).toContain('left: 88px')
    await wrapper.setProps({ x: 375 })
    expect(wrapper.get('[role="status"]').attributes('style')).toContain('left: 287px')
    wrapper.unmount()
  })

  it('flips below an anchor too close to the top of the viewport', async () => {
    const wrapper = mount(ChartTooltip, { props: { x: 180, y: 20, visible: true } })
    expect(wrapper.get('[role="status"]').attributes('style')).toContain('top: 34px')
    await wrapper.setProps({ y: 200 })
    expect(wrapper.get('[role="status"]').attributes('style')).toContain('top: 190px')
    wrapper.unmount()
  })
})
