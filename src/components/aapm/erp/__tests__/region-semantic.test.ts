import { describe, expect, it } from 'vitest'

import { isSemanticState } from '@/design-system/states'

import { REGION_SEMANTIC } from '../types'

describe('uX-07 regions → semantic vocabulary', () => {
  it('maps UX-07 regions onto the vocabulary without renaming them', () => {
    expect(REGION_SEMANTIC).toEqual({
      'loading': 'data.loading',
      'empty': 'data.empty',
      'no-matches': 'data.no_data',
      'server-error': 'data.error',
      'offline': 'freshness.offline',
      'job': 'work.in_progress',
      'validation': null,
      'forbidden': null,
      'conflict': null,
      'session-expired': null,
      'missing': null,
    })
  })

  it('every mapped value is a real semantic state', () => {
    for (const state of Object.values(REGION_SEMANTIC).filter(Boolean))
      expect(isSemanticState(state!)).toBe(true)
  })
})
