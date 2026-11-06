import { describe, expect, it } from 'vitest'

import type { TimelineEvent } from '@/components/aapm/erp/types'

import { isSemanticState } from '@/design-system/states'

import type { ActivityEntry, ActivityKind } from '../lifecycle'

import { ACTIVITY_LABEL, ACTIVITY_STATE, READINESS_LABEL, READINESS_STATE } from '../lifecycle'

describe('lifecycle contracts', () => {
  it('every readiness result maps to a real semantic state', () => {
    for (const r of ['ready', 'blocked', 'incomplete', 'unknown'] as const)
      expect(isSemanticState(READINESS_STATE[r]), r).toBe(true)
  })

  it('maps readiness results per spec', () => {
    expect(READINESS_STATE).toEqual({ ready: 'data.ready', blocked: 'work.blocked', incomplete: 'data.partial', unknown: 'data.no_data' })
    expect(READINESS_LABEL).toEqual({ ready: 'Siap', blocked: 'Terblokir', incomplete: 'Belum lengkap', unknown: 'Tidak diketahui' })
  })

  it('every mapped activity kind is a semantic state', () => {
    for (const s of Object.values(ACTIVITY_STATE))
      expect(isSemanticState(s!)).toBe(true)
    expect(ACTIVITY_STATE.corrected).toBe('history.corrected')
    expect(ACTIVITY_STATE.approved).toBe('work.completed')
  })

  it('labels every activity kind', () => {
    expect(Object.keys(ACTIVITY_LABEL).sort()).toEqual(['approved', 'commented', 'corrected', 'created', 'delegated', 'posted', 'progress', 'rejected', 'reopened', 'returned', 'reversed', 'submitted'])
  })

  it('a TimelineEvent is a compatible subset of ActivityEntry', () => {
    const event: TimelineEvent = { id: 'e1', action: 'approved', actor: 'Rina', role: 'Manajer', at: '05/11/2026 10.00' }
    const entry: ActivityEntry = { ...event, kind: event.action as ActivityKind }
    expect(entry.kind).toBe('approved')
  })
})
