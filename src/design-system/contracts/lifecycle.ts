/**
 * Lifecycle contracts (B2b): readiness, reasoned actions, revisions, activity, decisions,
 * corrections, delegation and feature availability. AAPM_Ecosystem §7–§9 and ERP UX-05/UX-06.
 *
 * Plain data shapes: business rules, permissions and persistence stay with the consumer/server.
 * Components render these and emit intents; every visible state goes through the B1 vocabulary.
 */
import type { Impact } from '@/components/aapm/erp/types'
import type { SemanticState } from '@/design-system/states'

export type { Impact }

export type ReadinessResult = 'ready' | 'blocked' | 'incomplete' | 'unknown'
export interface ActionRef { label: string, to?: string, intent?: string }
export interface Blocker { code: string, title: string, reason: string, resolution?: string, source?: ActionRef }
export interface Readiness {
  subject: string
  result: ReadinessResult
  evaluatedAt?: Date | number
  /** Order is the consumer's and is kept as given. */
  blockers: Blocker[]
  satisfied?: string[]
  next?: ActionRef
}

/** Ecosystem action availability contract: AVAILABLE · DISABLED WITH REASON · LOADING · COMPLETED. */
export type ActionAvailability
  = | { state: 'available' }
    | { state: 'disabled', reason: string }
    | { state: 'loading' }
    | { state: 'done', note?: string }

export interface Evidence { label: string, href?: string, kind?: 'file' | 'photo' | 'link' }

/** Revision / provenance minimum contract. Values are display strings with units ("1.200 kg"). */
export interface Revision {
  field: string
  before: string
  after: string
  reason?: string
  actor: string
  at: Date | number
  evidence?: Evidence[]
  stateBefore?: SemanticState
  stateAfter?: SemanticState
}

export type ActivityKind = 'created' | 'submitted' | 'returned' | 'approved' | 'rejected' | 'posted' | 'reversed' | 'commented' | 'corrected' | 'reopened' | 'delegated' | 'progress'
export interface ActivityEntry {
  id: string
  kind: ActivityKind
  actor: string
  role?: string
  at: Date | number | string
  reason?: string
  state?: SemanticState
  evidence?: Evidence[]
  revisions?: Revision[]
  /** Lineage (PC11): where the change came from, and the request it belongs to. */
  source?: { label: string, ref: string }
  correlationId?: string
  /** ProgressLog: the entry this one corrects (append-only correction). */
  corrects?: string
  attachments?: number
}

export interface DecisionOption { value: string, label: string, tone: 'approve' | 'reject' | 'neutral', reasonRequired: boolean, effect: string }
export interface DecisionContext { document: string, company: string, options: DecisionOption[], evidence?: Evidence[], impacts?: Impact[] }

export interface CorrectionField { key: string, label: string, unit?: string, original: string, kind: 'number' | 'text' }

export interface Approver { name: string, role: string, onBehalfOf?: string }
export interface Delegation { delegator: string, delegate: string, from: Date | number, to: Date | number, scope: string }

export interface FeatureAvailability {
  feature: string
  enabled: boolean
  reason?: string
  setting?: { key: string, scope: 'system' | 'tenant' | 'company', to?: string }
}

export const READINESS_STATE: Record<ReadinessResult, SemanticState> = {
  ready: 'data.ready',
  blocked: 'work.blocked',
  incomplete: 'data.partial',
  unknown: 'data.no_data',
}
export const READINESS_LABEL: Record<ReadinessResult, string> = {
  ready: 'Siap',
  blocked: 'Terblokir',
  incomplete: 'Belum lengkap',
  unknown: 'Tidak diketahui',
}

export const ACTIVITY_STATE: Partial<Record<ActivityKind, SemanticState>> = {
  submitted: 'work.pending_review',
  returned: 'work.pending',
  approved: 'work.completed',
  rejected: 'history.rejected',
  posted: 'work.completed',
  reversed: 'history.invalidated',
  corrected: 'history.corrected',
  reopened: 'history.reopened',
  delegated: 'work.assigned',
}
export const ACTIVITY_LABEL: Record<ActivityKind, string> = {
  created: 'Membuat draft',
  submitted: 'Mengajukan',
  returned: 'Mengembalikan untuk revisi',
  approved: 'Menyetujui',
  rejected: 'Menolak',
  posted: 'Memposting',
  reversed: 'Membalik dokumen',
  commented: 'Memberi catatan',
  corrected: 'Mengoreksi',
  reopened: 'Membuka kembali',
  delegated: 'Mendelegasikan',
  progress: 'Mencatat progres',
}

export const SETTING_SCOPE_LABEL: Record<NonNullable<FeatureAvailability['setting']>['scope'], string> = {
  system: 'Sistem',
  tenant: 'Tenant',
  company: 'Perusahaan',
}
