/**
 * Tone map — categorical colour for every status / priority / label / role / plan in the app,
 * so a column scans at a glance (Task 8). Colour is never the only signal: <ToneChip> always
 * renders an icon or dot plus text. Token values live in assets/tokens/tones.css.
 *
 * Meaning stays consistent across domains: green = done / healthy / paid, red = failed / overdue /
 * suspended, amber = waiting / due soon, blue = in flight / submitted, violet = review / admin,
 * teal = active, neutral = draft / inactive / cancelled, orange = high priority / attention.
 *
 * State domains (doc, task, billing, order) go business value → semantic state
 * (src/design-system/states.ts) → tone, as the AAPM Ecosystem requires; an explicit `tone` keeps
 * each chip's approved colour where it differs from the state's default. Categorical domains
 * (priority, label, role, plan, severity, user, session) are categories, not business states,
 * so they keep direct tones.
 */
import type { SemanticState } from '@/design-system/states'

import { stateMeta } from '@/design-system/states'

export const TONES = ['neutral', 'green', 'lime', 'teal', 'blue', 'violet', 'pink', 'red', 'orange', 'amber'] as const
export type Tone = (typeof TONES)[number]

type StateEntry = SemanticState | { state: SemanticState, tone: Tone }

/** Business value → semantic state, with a tone override where today's chip colour differs. */
export const STATE_DOMAINS = {
  /** ERP document lifecycle (components/aapm/erp/types.ts DocStatus). */
  doc: {
    draft: 'work.draft',
    submitted: { state: 'work.pending_review', tone: 'blue' },
    review: { state: 'work.pending_decision', tone: 'amber' },
    verified: { state: 'work.pending', tone: 'teal' },
    posted: 'work.completed',
    paid: { state: 'work.terminal', tone: 'green' },
    rejected: 'history.rejected',
    reversed: { state: 'history.invalidated', tone: 'violet' },
    locked: 'work.terminal',
  },
  task: {
    'backlog': 'work.unassigned',
    'todo': 'work.assigned',
    'in progress': { state: 'work.in_progress', tone: 'amber' },
    'done': 'work.completed',
    'canceled': { state: 'history.withdrawn', tone: 'red' },
  },
  billing: {
    paid: 'work.completed',
    unpaid: 'work.pending',
    overdue: { state: 'work.delayed', tone: 'red' },
    cancelled: 'history.withdrawn',
  },
  order: {
    draft: 'work.draft',
    shipped: 'work.in_progress',
    paid: 'work.completed',
    due: 'work.pending',
  },
} as const satisfies Record<string, Record<string, StateEntry>>

export type StateDomain = keyof typeof STATE_DOMAINS

const entryState = (entry: StateEntry): SemanticState => typeof entry === 'string' ? entry : entry.state
const entryTone = (entry: StateEntry): Tone => typeof entry === 'string' ? stateMeta(entry).tone : entry.tone
function tonesOf<D extends Record<string, StateEntry>>(domain: D): { readonly [K in keyof D]: Tone } {
  return Object.fromEntries(Object.entries(domain).map(([value, entry]) => [value, entryTone(entry)])) as { [K in keyof D]: Tone }
}

export const TONE_MAP = {
  doc: tonesOf(STATE_DOMAINS.doc),
  task: tonesOf(STATE_DOMAINS.task),
  priority: {
    // calm → urgent; low is a quiet blue, never grey (grey reads as "disabled")
    low: 'blue',
    medium: 'amber',
    high: 'orange',
  },
  label: {
    bug: 'red',
    feature: 'violet',
    documentation: 'teal',
  },
  user: {
    active: 'green',
    inactive: 'neutral',
    invited: 'blue',
    suspended: 'red',
  },
  role: {
    superadmin: 'violet',
    admin: 'blue',
    manager: 'teal',
    cashier: 'amber',
  },
  billing: tonesOf(STATE_DOMAINS.billing),
  plan: {
    'basic': 'neutral',
    'Free': 'neutral',
    'Small Business': 'blue',
    'Enterprise': 'violet',
  },
  order: tonesOf(STATE_DOMAINS.order),
  severity: {
    danger: 'red',
    warning: 'amber',
    info: 'blue',
    success: 'green',
  },
  session: {
    current: 'green',
    active: 'teal',
    expired: 'neutral',
    revoked: 'red',
  },
} as const satisfies Record<string, Record<string, Tone>>

export type ToneDomain = keyof typeof TONE_MAP

/** The tone for a value in a domain; anything unknown reads as neutral, never as a wrong colour. */
export function toneOf(domain: ToneDomain, value: string | null | undefined): Tone {
  const map = TONE_MAP[domain] as Record<string, Tone>
  return (value != null && Object.hasOwn(map, value)) ? map[value]! : 'neutral'
}

/** The semantic state behind a business value; null for unknown values (never a guessed state). */
export function semanticOf(domain: StateDomain, value: string | null | undefined): SemanticState | null {
  const map = STATE_DOMAINS[domain] as Record<string, StateEntry>
  return (value != null && Object.hasOwn(map, value)) ? entryState(map[value]!) : null
}
