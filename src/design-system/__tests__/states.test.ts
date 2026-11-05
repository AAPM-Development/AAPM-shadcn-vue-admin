import { describe, expect, it } from 'vitest'

import { ICONS } from '@/components/aapm/icon/registry'
import { TONES } from '@/components/aapm/tone/tones'

import { isSemanticState, SEMANTIC_STATES, STATE_FAMILIES, stateMeta } from '../states'

/** AAPM_Ecosystem ECOSYSTEM_UI_CAPABILITY_REQUIREMENTS §17, verbatim. */
const ECOSYSTEM = {
  data: ['loading', 'ready', 'empty', 'no_data', 'error', 'retrying', 'partial'],
  freshness: ['current', 'stale', 'offline', 'syncing', 'sync_failed'],
  work: ['unassigned', 'assigned', 'pending', 'pending_review', 'pending_decision', 'conditional', 'hold', 'blocked', 'exception', 'delayed', 'completed', 'terminal'],
  history: ['corrected', 'superseded', 'reopened', 'withdrawn', 'rejected', 'invalidated'],
} as const

describe('semantic state vocabulary', () => {
  it('has the four Ecosystem families', () => {
    expect([...STATE_FAMILIES]).toEqual(['data', 'freshness', 'work', 'history'])
  })

  it('contains exactly the 30 Ecosystem states plus the 2 flagged extensions', () => {
    const ext = Object.values(SEMANTIC_STATES).filter(m => m.extension)
    expect(ext.map(m => `${m.family}.${m.state}`).sort()).toEqual(['work.draft', 'work.in_progress'])
    expect(ext.every(m => m.rationale?.trim())).toBe(true)
    for (const [family, states] of Object.entries(ECOSYSTEM)) {
      for (const s of states)
        expect(isSemanticState(`${family}.${s}`), `${family}.${s}`).toBe(true)
    }
    expect(Object.keys(SEMANTIC_STATES)).toHaveLength(32)
  })

  it('every state has a known tone, a registered icon and a label', () => {
    for (const [key, m] of Object.entries(SEMANTIC_STATES)) {
      expect(key).toBe(`${m.family}.${m.state}`)
      expect(TONES, key).toContain(m.tone)
      expect(m.icon in ICONS, `${key} icon ${m.icon}`).toBe(true)
      expect(m.label.trim(), key).not.toBe('')
    }
  })

  it('keeps the spec tones and labels', () => {
    expect(stateMeta('work.pending_decision').tone).toBe('pink')
    expect(stateMeta('freshness.syncing').tone).toBe('blue')
    expect(stateMeta('data.error')).toMatchObject({ tone: 'red', icon: 'danger', label: 'Gagal dimuat' })
    expect(stateMeta('history.superseded').label).toBe('Digantikan')
    expect(stateMeta('work.draft')).toMatchObject({ tone: 'neutral', icon: 'edit', label: 'Draf' })
  })

  it('rejects strings outside the vocabulary', () => {
    expect(isSemanticState('work.nope')).toBe(false)
    expect(isSemanticState('loading')).toBe(false)
  })
})
