// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { CAPABILITIES } from '@/design-system/capabilities'

import KitCapabilities from '../kit-capabilities.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } }

describe('kapabilitas tab', () => {
  it('pressing the active "Semua" again never empties the table', async () => {
    const w = mount(KitCapabilities, { global: { stubs } })
    expect(w.findAll('tbody tr')).toHaveLength(CAPABILITIES.length)
    const all = w.findAll('[aria-label="Filter status"] button').find(b => b.text() === 'Semua')!
    await all.trigger('click')
    expect(w.findAll('tbody tr')).toHaveLength(CAPABILITIES.length)
    expect(w.text()).toContain(`Menampilkan ${CAPABILITIES.length} dari ${CAPABILITIES.length}`)
  })

  it('filter captions are plain text, not labels that steal the first toggle', () => {
    const w = mount(KitCapabilities, { global: { stubs } })
    expect(w.findAll('label')).toHaveLength(0)
  })

  it('headers never break mid-word and IDs are row headers', () => {
    const w = mount(KitCapabilities, { global: { stubs } })
    for (const th of w.findAll('thead th'))
      expect(th.classes()).toContain('whitespace-nowrap')
    expect(w.findAll('tbody th[scope="row"]')).toHaveLength(CAPABILITIES.length)
  })
})
