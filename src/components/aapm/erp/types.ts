import type { SemanticState } from '@/design-system/states'

/** Shared ERP component types (kept out of <script setup>, which cannot export). */
export type DocStatus = 'draft' | 'submitted' | 'review' | 'verified' | 'posted' | 'paid' | 'rejected' | 'reversed' | 'locked'

export interface TimelineEvent {
  id: string
  action: 'created' | 'submitted' | 'returned' | 'approved' | 'rejected' | 'posted' | 'reversed' | 'commented'
  actor: string
  role: string
  at: string
  reason?: string
  attachments?: number
}

export interface Movement {
  id: string
  date: string
  doc: string
  type: string
  lot: string
  qty: number
}

export interface JournalLine {
  account: string
  name: string
  debit: number
  credit: number
}

export interface Impact {
  label: string
  unit: string
  before: number
  change: number
}

export type RegionState = 'loading' | 'empty' | 'no-matches' | 'validation' | 'forbidden' | 'conflict' | 'session-expired' | 'missing' | 'offline' | 'server-error' | 'job'

/**
 * UX-07 regions on the AAPM semantic vocabulary (names unchanged). Access and integrity states
 * (validation, forbidden, conflict, session-expired, missing) belong to the ERP UX-07 contract and
 * have no Ecosystem family, so they map to null.
 */
export const REGION_SEMANTIC: Record<RegionState, SemanticState | null> = {
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
}
