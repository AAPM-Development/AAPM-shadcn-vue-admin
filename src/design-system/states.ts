/**
 * AAPM semantic state vocabulary (B1 foundation).
 *
 * The shared state families from AAPM_Ecosystem ECOSYSTEM_UI_CAPABILITY_REQUIREMENTS §17, plus
 * two flagged AAPM extensions. Product business states never map straight to a colour:
 *
 *   business value → semantic state (this file) → tone (assets/tokens/tones.css) → theme
 *
 * Each state carries the visual role (tone), a semantic icon from the registry and an id-ID label,
 * so a chip always says what it means in text as well as in colour.
 */
import type { IconName } from '@/components/aapm/icon/registry'
import type { Tone } from '@/components/aapm/tone/tones'

export const STATE_FAMILIES = ['data', 'freshness', 'work', 'history'] as const
export type StateFamily = (typeof STATE_FAMILIES)[number]

export interface StateMeta {
  family: StateFamily
  state: string
  tone: Tone
  icon: IconName
  label: string
  /** An AAPM state with no Ecosystem equivalent; `rationale` says why it exists. */
  extension?: true
  rationale?: string
}

type Def = [state: string, tone: Tone, icon: IconName, label: string]

const DEFS = {
  data: [
    ['loading', 'neutral', 'loading', 'Memuat'],
    ['ready', 'green', 'success', 'Siap'],
    ['empty', 'neutral', 'inbox', 'Kosong'],
    ['no_data', 'neutral', 'noData', 'Tidak ada data'],
    ['error', 'red', 'danger', 'Gagal dimuat'],
    ['retrying', 'amber', 'refresh', 'Mencoba lagi'],
    ['partial', 'amber', 'incomplete', 'Sebagian'],
  ],
  freshness: [
    ['current', 'green', 'success', 'Terkini'],
    ['stale', 'amber', 'stale', 'Belum diperbarui'],
    ['offline', 'neutral', 'offline', 'Luring'],
    ['syncing', 'blue', 'refresh', 'Menyinkronkan'],
    ['sync_failed', 'red', 'danger', 'Gagal sinkron'],
  ],
  work: [
    ['unassigned', 'neutral', 'incomplete', 'Belum ditugaskan'],
    ['assigned', 'blue', 'userCheck', 'Ditugaskan'],
    ['pending', 'amber', 'pending', 'Menunggu'],
    ['pending_review', 'violet', 'view', 'Menunggu review'],
    ['pending_decision', 'pink', 'decision', 'Menunggu keputusan'],
    ['conditional', 'teal', 'checklist', 'Bersyarat'],
    ['hold', 'orange', 'hold', 'Ditahan'],
    ['blocked', 'red', 'ban', 'Terblokir'],
    ['exception', 'red', 'warning', 'Pengecualian'],
    ['delayed', 'orange', 'timer', 'Terlambat'],
    ['completed', 'green', 'success', 'Selesai'],
    ['terminal', 'neutral', 'locked', 'Final'],
  ],
  history: [
    ['corrected', 'blue', 'corrected', 'Dikoreksi'],
    ['superseded', 'neutral', 'superseded', 'Digantikan'],
    ['reopened', 'amber', 'reopen', 'Dibuka kembali'],
    ['withdrawn', 'neutral', 'reverse', 'Ditarik'],
    ['rejected', 'red', 'danger', 'Ditolak'],
    ['invalidated', 'red', 'invalidated', 'Dibatalkan'],
  ],
} as const satisfies Record<StateFamily, readonly Def[]>

/** AAPM extensions: ERP drafts and in-flight work have no Ecosystem equivalent. */
const EXTENSIONS = [
  { family: 'work', state: 'draft', tone: 'neutral', icon: 'edit', label: 'Draf', rationale: 'ERP documents are prepared before they enter any work queue; no Ecosystem work state means "not yet submitted".' },
  { family: 'work', state: 'in_progress', tone: 'blue', icon: 'inProgress', label: 'Sedang berjalan', rationale: 'Tasks, shipments and background jobs that are actively moving; the Ecosystem only has assigned/pending, neither of which means "underway".' },
] as const

type EcosystemState = { [F in StateFamily]: `${F}.${(typeof DEFS)[F][number][0]}` }[StateFamily]
type ExtensionState = `${(typeof EXTENSIONS)[number]['family']}.${(typeof EXTENSIONS)[number]['state']}`
export type SemanticState = EcosystemState | ExtensionState

export const SEMANTIC_STATES: Readonly<Record<SemanticState, StateMeta>> = Object.freeze(Object.fromEntries([
  ...STATE_FAMILIES.flatMap(family => DEFS[family].map(([state, tone, icon, label]) =>
    [`${family}.${state}`, { family, state, tone, icon, label }] as const)),
  ...EXTENSIONS.map(e => [`${e.family}.${e.state}`, { ...e, extension: true }] as const),
]) as Record<SemanticState, StateMeta>)

export function isSemanticState(value: string): value is SemanticState {
  return Object.hasOwn(SEMANTIC_STATES, value)
}

export function stateMeta(state: SemanticState): StateMeta {
  return SEMANTIC_STATES[state]
}
