// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { KIT_ANCHOR_TAB } from '../kit-anchors'
import KitLifecycle from '../kit-lifecycle.vue'

const ANCHORS = ['kesiapan', 'aksi-beralasan', 'keputusan', 'koreksi', 'progres', 'revisi', 'aktivitas', 'ringkasan', 'terkait', 'entitas-360', 'delegasi', 'fitur']
const stubs = { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } }

describe('siklus & keputusan tab', () => {
  it('every lifecycle anchor renders and maps to the siklus tab', () => {
    const w = mount(KitLifecycle, { global: { stubs }, attachTo: document.body })
    for (const id of ANCHORS) {
      expect(w.find(`[id="${id}"]`).exists(), id).toBe(true)
      expect(KIT_ANCHOR_TAB[id], id).toBe('siklus')
    }
    w.unmount()
  })
})
