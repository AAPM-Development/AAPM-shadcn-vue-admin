/**
 * Toast v2 — thin wrappers over vue-sonner (styles: assets/motion/toast.css).
 * - success / info / warning: pastel wash, coloured icon, 3px accent.
 * - blocking: the error channel (solid red, white text, shake) held for 6s; plugins/sound plays the blocked buzz.
 * Direct `toast.*` calls get the same look through `[data-type]`; these wrappers add the class,
 * duration and the `--aapm-toast-duration` used by the remaining-time bar.
 */
import type { ExternalToast } from 'vue-sonner'

import { toast } from 'vue-sonner'

export type NotifyType = 'success' | 'info' | 'warning' | 'blocking'

export const BLOCKING_DURATION = 6000

function options(type: NotifyType, opts: ExternalToast = {}, duration?: number): ExternalToast {
  const ms = opts.duration ?? duration
  // Infinity (sticky toast): sonner never auto-closes it, so it gets no remaining-time bar
  const persistent = ms !== undefined && !Number.isFinite(ms)
  const timing = ms !== undefined && !persistent ? { '--aapm-toast-duration': `${ms}ms` } : {}
  return {
    ...opts,
    ...(ms === undefined ? {} : { duration: ms }),
    class: ['aapm-toast', `aapm-toast--${type}`, persistent ? 'aapm-toast--persistent' : '', opts.class ?? ''].filter(Boolean).join(' '),
    style: { ...timing, ...opts.style },
  }
}

export const notify = {
  success: (title: string, opts?: ExternalToast) => toast.success(title, options('success', opts)),
  info: (title: string, opts?: ExternalToast) => toast.info(title, options('info', opts)),
  warning: (title: string, opts?: ExternalToast) => toast.warning(title, options('warning', opts)),
  blocking: (title: string, opts?: ExternalToast) => toast.error(title, options('blocking', opts, BLOCKING_DURATION)),
}
