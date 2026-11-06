// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Entity360 from '../Entity360.vue'
import KeyValueList from '../KeyValueList.vue'
import RelatedObjects from '../RelatedObjects.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } }

describe('record patterns', () => {
  it('key-value keeps units and dashes empty values', () => {
    const w = mount(KeyValueList, { props: { items: [{ key: 'Berat', value: '1.250,5', unit: 'kg' }, { key: 'Lot', value: '' }] } })
    expect(w.find('dl').exists()).toBe(true)
    const dd = w.findAll('dd').map(d => d.text())
    expect(dd).toEqual(['1.250,5 kg', '—'])
    expect(w.findAll('dt').map(d => d.text())).toEqual(['Berat', 'Lot'])
  })

  it('empty key-value list renders its empty state', () => {
    expect(mount(KeyValueList, { props: { items: [] } }).text()).toContain('Belum ada data')
  })

  it('related objects link and show state', () => {
    const w = mount(RelatedObjects, { props: { items: [{ label: 'Faktur pembelian', ref: 'PI-2611-031', state: 'history.withdrawn', to: '/ui-kit#terkait' }] }, global: { stubs } })
    expect(w.get('a').attributes('href')).toBe('/ui-kit#terkait')
    expect(w.find('[data-semantic-state="history.withdrawn"]').exists()).toBe(true)
    expect(w.text()).toContain('PI-2611-031')
  })

  it('empty related objects renders its empty state', () => {
    expect(mount(RelatedObjects, { props: { items: [] }, global: { stubs } }).text()).toContain('Belum ada dokumen terkait')
  })

  it('entity 360 renders summary and tabs with per-slot empty states', () => {
    const w = mount(Entity360, { props: { title: 'CV Minang Pangan', subtitle: 'Pemasok jagung', state: 'work.completed' }, slots: { summary: '<p>Ringkasan pemasok</p>' }, attachTo: document.body })
    expect(w.text()).toContain('CV Minang Pangan')
    expect(w.text()).toContain('Ringkasan pemasok')
    expect(w.findAll('[data-slot="tabs-trigger"]').map(t => t.text())).toEqual(['Aktivitas', 'Terkait', 'Dokumen'])
    expect(w.text()).toContain('Belum ada aktivitas')
    w.unmount()
  })
})
