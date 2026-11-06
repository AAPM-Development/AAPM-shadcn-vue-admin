// @vitest-environment happy-dom

import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import type { ActionAvailability } from '@/design-system/contracts'

import ReasonedAction from '../ReasonedAction.vue'

const REASON = 'Periode November sudah dikunci'
const mountAction = (availability: ActionAvailability) => mount(ReasonedAction, { props: { availability }, slots: { default: 'Buka koreksi' }, attachTo: document.body })

describe('reasonedAction', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('disabled stays focusable and explains itself', () => {
    const w = mountAction({ state: 'disabled', reason: REASON })
    const btn = w.get('button')
    expect(btn.attributes('disabled')).toBeUndefined()
    expect(btn.attributes('aria-disabled')).toBe('true')
    expect(btn.attributes('tabindex')).not.toBe('-1')
    const describedBy = btn.attributes('aria-describedby')!
    expect(document.getElementById(describedBy)?.textContent).toContain(REASON)
  })

  it('keyboard cannot activate a disabled action and focus reveals the reason', async () => {
    const w = mountAction({ state: 'disabled', reason: REASON })
    const btn = w.get('button')
    await btn.trigger('click')
    await btn.trigger('keydown', { key: 'Enter' })
    await btn.trigger('keydown', { key: ' ' })
    expect(w.emitted('activate')).toBeUndefined()
    await btn.trigger('focus')
    await nextTick()
    expect(document.body.querySelector('[data-slot="tooltip-content"]')?.textContent).toContain(REASON)
  })

  it('loading blocks activation and keeps its width', async () => {
    const w = mountAction({ state: 'available' })
    await w.setProps({ availability: { state: 'loading' } })
    const btn = w.get('button')
    expect(btn.attributes('aria-busy')).toBe('true')
    expect(btn.find('[data-slot="spinner"], [role="status"], svg').exists()).toBe(true)
    expect((btn.element as HTMLElement).style.minWidth).not.toBe('')
    await btn.trigger('click')
    expect(w.emitted('activate')).toBeUndefined()
  })

  it('done shows its note', () => {
    const w = mountAction({ state: 'done', note: 'Sudah diajukan' })
    expect(w.text()).toContain('Sudah diajukan')
    expect(w.get('button').attributes('aria-disabled')).toBe('true')
  })

  it('available emits activate once per click', async () => {
    const w = mountAction({ state: 'available' })
    await w.get('button').trigger('click')
    expect(w.emitted('activate')).toHaveLength(1)
  })

  // Layout audit (B2b T11, --stress longword): shadcn Button is nowrap, so a long label set the
  // min-content of every ancestor grid and pushed the page sideways (#41, #98, #101).
  it('a long label wraps inside its container instead of widening it', () => {
    const cls = mountAction({ state: 'available' }).get('button').classes()
    expect(cls).toEqual(expect.arrayContaining(['max-w-full', 'whitespace-normal', 'wrap-anywhere', 'h-auto', 'min-h-9']))
    const sm = mount(ReasonedAction, { props: { availability: { state: 'available' }, size: 'sm' }, slots: { default: 'Buka' } })
    expect(sm.get('button').classes()).toContain('min-h-8')
  })
})
