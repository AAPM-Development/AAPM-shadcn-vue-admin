// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import BarList from '../bar-list.vue'
import { stagger, useChartInView } from '../use-chart-inview'

type IOCallback = (entries: { isIntersecting: boolean }[]) => void
let ioCallback: IOCallback | undefined
const disconnect = vi.fn()

class FakeIO {
  constructor(cb: IOCallback) {
    ioCallback = cb
  }

  observe() {}
  disconnect = disconnect
}

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: reduce && q.includes('reduce'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
}

const Probe = defineComponent({
  setup() {
    const root = ref<HTMLElement | null>(null)
    const inView = useChartInView(root)
    return () => h('div', { ref: root }, String(inView.value))
  },
})

describe('chart entrance', () => {
  beforeEach(() => {
    ioCallback = undefined
    vi.stubGlobal('IntersectionObserver', FakeIO)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('chart waits for view: data-aapm-inview only once it intersects, then stops observing', async () => {
    setReducedMotion(false)
    const wrapper = mount(Probe)
    await nextTick()
    const el = wrapper.element as HTMLElement
    expect(el.hasAttribute('data-aapm-chart')).toBe(true)
    expect(el.hasAttribute('data-aapm-inview')).toBe(false)
    expect(el.textContent).toBe('false')

    ioCallback!([{ isIntersecting: false }])
    expect(el.hasAttribute('data-aapm-inview')).toBe(false)

    ioCallback!([{ isIntersecting: true }])
    await nextTick()
    expect(el.hasAttribute('data-aapm-inview')).toBe(true)
    expect(el.textContent).toBe('true')
    expect(disconnect).toHaveBeenCalled()
  })

  it('reduced motion renders final state at mount', async () => {
    setReducedMotion(true)
    const wrapper = mount(Probe)
    await nextTick()
    expect(wrapper.element.hasAttribute('data-aapm-inview')).toBe(true)
    expect(wrapper.text()).toBe('true')
    expect(ioCallback).toBeUndefined()
  })

  it('bar list keeps exact values readable before the entrance and marks bars for tweening', async () => {
    setReducedMotion(false)
    const wrapper = mount(BarList, {
      props: { label: 'Produksi per kandang', unit: 'kg', items: [{ label: 'B3', value: 1200 }, { label: 'A1', value: 600 }] },
    })
    await nextTick()
    expect(wrapper.text()).toContain('1.200')
    const bars = wrapper.findAll('[data-aapm-bar]')
    expect(bars).toHaveLength(2)
    expect(bars[1]!.attributes('style')).toContain('width: 50%')
  })

  it('stagger is 40ms per bar, capped', () => {
    expect(stagger(0)).toBe(0)
    expect(stagger(3)).toBeCloseTo(0.12)
    expect(stagger(50)).toBe(0.32)
  })
})
