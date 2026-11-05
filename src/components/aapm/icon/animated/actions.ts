import type { IconName } from '../registry'

/**
 * Action icons whose SVG parts animate by meaning (spec: motion v2 interaction catalog).
 * Each entry names its registry glyph, the `@keyframes` in assets/motion/icons.css, and what plays it:
 * - press: the nearest button's pointerdown (or keyboard click), or `play` turning true
 * - hover: the nearest button's pointerenter / pointerleave drives a hover pose; `play` runs the keyframes
 * - state: only `play` (e.g. new notification, panel open, approved)
 */
export type ActionName
  = | 'like'
    | 'copy'
    | 'share'
    | 'refresh'
    | 'print'
    | 'delete'
    | 'save'
    | 'download'
    | 'upload'
    | 'export'
    | 'notification'
    | 'filter'
    | 'sort'
    | 'chevronDown'
    | 'submit'
    | 'approve'

export type ActionTrigger = 'press' | 'hover' | 'state'

export interface AnimatedAction {
  icon: IconName
  keyframes: string
  trigger: ActionTrigger
  /** Keeps repeating while `play` stays true; stops on the next full cycle. */
  loop?: boolean
}

export const ANIMATED_ACTIONS: Record<ActionName, AnimatedAction> = {
  like: { icon: 'like', keyframes: 'aapm-icon-like', trigger: 'press' },
  copy: { icon: 'copy', keyframes: 'aapm-icon-copy', trigger: 'press' },
  share: { icon: 'share', keyframes: 'aapm-icon-share', trigger: 'press' },
  refresh: { icon: 'refresh', keyframes: 'aapm-icon-refresh', trigger: 'press', loop: true },
  print: { icon: 'print', keyframes: 'aapm-icon-print', trigger: 'press' },
  delete: { icon: 'delete', keyframes: 'aapm-icon-delete', trigger: 'hover' },
  save: { icon: 'save', keyframes: 'aapm-icon-save', trigger: 'press' },
  download: { icon: 'download', keyframes: 'aapm-icon-download', trigger: 'press' },
  upload: { icon: 'upload', keyframes: 'aapm-icon-upload', trigger: 'press' },
  export: { icon: 'export', keyframes: 'aapm-icon-export', trigger: 'press' },
  notification: { icon: 'notification', keyframes: 'aapm-icon-notification', trigger: 'state' },
  filter: { icon: 'filter', keyframes: 'aapm-icon-filter', trigger: 'press' },
  sort: { icon: 'sort', keyframes: 'aapm-icon-sort', trigger: 'press' },
  chevronDown: { icon: 'chevronDown', keyframes: 'aapm-icon-chevronDown', trigger: 'state' },
  submit: { icon: 'submit', keyframes: 'aapm-icon-submit', trigger: 'press' },
  approve: { icon: 'approve', keyframes: 'aapm-icon-approve', trigger: 'state' },
}

export const ACTION_NAMES = Object.keys(ANIMATED_ACTIONS) as ActionName[]

export function isActionName(name: string): name is ActionName {
  return Object.hasOwn(ANIMATED_ACTIONS, name)
}

/** Copy: the sheet slides out, then a check replaces the glyph for COPY_CHECK_MS. */
export const COPY_SWAP_MS = 320
export const COPY_CHECK_MS = 1200
