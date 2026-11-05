/**
 * App-wide motion enhancements that CSS alone cannot express. Registered from plugins/index.ts.
 *
 * Every ./*.module.ts default-exports a MotionModule and is discovered here — there is no shared
 * registration file to edit. Current modules: action icons, calendar/pickers, smooth caret,
 * layout stability, radio cards, select/menu pill, slider, tab indicator.
 */
import type { MotionModule } from './types'

const modules = import.meta.glob<{ default: MotionModule }>('./*.module.ts', { eager: true })

/** Module file names (without extension), for the coverage test and debugging. */
export const MOTION_MODULE_NAMES = Object.keys(modules).map(path => path.replace(/^\.\/|\.module\.ts$/g, '')).sort()

export function setupMotion() {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined')
    return
  const start = () => Object.values(modules).forEach(m => m.default())
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, { once: true })
  else
    start()
}
