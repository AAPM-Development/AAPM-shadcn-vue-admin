// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { ActivityEntry, Revision } from '@/design-system/contracts'

import ActivityFeed from '../ActivityFeed.vue'
import RevisionDiff from '../RevisionDiff.vue'

const at = new Date('2026-11-05T10:42:00+07:00')
const rev: Revision = { field: 'Kuantitas baris 2', before: '1.200 kg', after: '1.250,5 kg', reason: 'Timbang ulang di gudang', actor: 'Yulia Fitri', at, evidence: [{ label: 'Foto timbangan', href: '#foto' }] }

describe('revisionDiff / ActivityFeed', () => {
  it('revision shows before → after with units, reason, actor', () => {
    const w = mount(RevisionDiff, { props: { revisions: [rev] } })
    expect(w.get('del').text()).toBe('1.200 kg')
    expect(w.get('ins').text()).toBe('1.250,5 kg')
    expect(w.text()).toContain('Timbang ulang di gudang')
    expect(w.text()).toContain('Yulia Fitri')
    expect(w.get('a[href="#foto"]').text()).toContain('Foto timbangan')
  })

  it('state change renders two chips', () => {
    const w = mount(RevisionDiff, { props: { revisions: [{ ...rev, stateBefore: 'work.completed', stateAfter: 'history.corrected' }] } })
    expect(w.findAll('[data-semantic-state]').map(c => c.attributes('data-semantic-state'))).toEqual(['work.completed', 'history.corrected'])
  })

  const entries: ActivityEntry[] = [
    { id: 'a1', kind: 'submitted', actor: 'Yulia Fitri', role: 'Gudang pakan', at, reason: 'Koreksi kuantitas' },
    { id: 'a2', kind: 'corrected', actor: 'Sistem', at, revisions: [rev], source: { label: 'Dokumen', ref: 'GRN-2611-0086' }, correlationId: 'req_01JC9X7Q4N2V8T' },
  ]

  it('activity feed is read-only', () => {
    const w = mount(ActivityFeed, { props: { entries } })
    expect(w.findAll('button, input, textarea, [contenteditable]')).toHaveLength(0)
  })

  it('lineage shows source and correlation id', () => {
    const w = mount(ActivityFeed, { props: { entries } })
    expect(w.text()).toContain('GRN-2611-0086')
    expect(w.text()).toContain('req_01JC9X7Q4N2V8T')
  })

  it('inline revisions render inside an entry, with its state chip', () => {
    const w = mount(ActivityFeed, { props: { entries } })
    const last = w.findAll('li[data-activity]').at(-1)!
    expect(last.find('del').text()).toBe('1.200 kg')
    expect(last.find('[data-semantic-state="history.corrected"]').exists()).toBe(true)
  })

  it('empty activity feed renders its empty state', () => {
    expect(mount(ActivityFeed, { props: { entries: [] } }).text()).toContain('Belum ada aktivitas')
  })
})
