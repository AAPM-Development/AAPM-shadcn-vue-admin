// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { TimelineEvent } from '../types'

import ApprovalTimeline from '../approval-timeline.vue'

/** Characterization (B2b T5): the preset over ActivityFeed must render exactly what it rendered before. */
const events: TimelineEvent[] = [
  { id: 'e1', action: 'created', actor: 'Yulia Fitri', role: 'Gudang pakan', at: '05/11/2026 10.31 WIB' },
  { id: 'e2', action: 'submitted', actor: 'Yulia Fitri', role: 'Gudang pakan', at: '05/11/2026 10.42 WIB', attachments: 2 },
  { id: 'e3', action: 'returned', actor: 'Doni Pratama', role: 'Kepala gudang', at: '05/11/2026 11.05 WIB', reason: 'Lot baris 2 belum sesuai label karung.' },
  { id: 'e4', action: 'reversed', actor: 'Doni Pratama', role: 'Kepala gudang', at: '05/11/2026 11.20 WIB' },
  { id: 'e5', action: 'commented', actor: 'Rina', role: 'Akuntansi', at: '05/11/2026 11.34 WIB' },
]
const TERMINAL = 'Terposting · dokumen terkunci, koreksi hanya lewat pembalikan'
/** test-utils text() drops the spaces CSS gaps provide visually; compare without whitespace. */
const norm = (s: string) => s.replace(/\s+/g, '')

describe('approvalTimeline compatibility', () => {
  it('keeps its rendered text and list semantics', () => {
    const w = mount(ApprovalTimeline, { props: { events, terminal: TERMINAL } })
    expect(norm(w.text())).toBe(norm([
      'Yulia Fitri · Gudang pakan membuat draft 05/11/2026 10.31 WIB',
      'Yulia Fitri · Gudang pakan mengajukan 05/11/2026 10.42 WIB · 2 lampiran',
      'Doni Pratama · Kepala gudang mengembalikan untuk revisi 05/11/2026 11.05 WIB “Lot baris 2 belum sesuai label karung.”',
      'Doni Pratama · Kepala gudang membalik dokumen 05/11/2026 11.20 WIB',
      'Rina · Akuntansi memberi catatan 05/11/2026 11.34 WIB',
      TERMINAL,
    ].join(' ')))
    expect(w.get('ol').attributes('aria-label')).toBe('Riwayat persetujuan')
  })
})
