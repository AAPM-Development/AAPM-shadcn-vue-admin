/**
 * Global soundpack wiring (lib/sound.ts). Registered from plugins/index.ts.
 * - Unlocks audio on the first pointer/key gesture (browser autoplay policy).
 * - Toasts: notify.blocking (.aapm-toast--blocking) → blocked, success → success, error → error, info/warning → notify.
 * - Dialog / confirmation open → pop. Switch / checkbox / radio / tab → tick.
 * Blocked-action buzz is played by motion-blur.ts `shake()`.
 */
import type { SoundName } from '@/lib/sound'

import { sound } from '@/lib/sound'

const TICK = '[data-slot="switch"], [data-slot="checkbox"], [data-slot="radio-group-item"], [data-slot="tabs-trigger"], [data-slot="toggle-group-item"], [data-slot="toggle"]'

/** notify.blocking() → blocked buzz; otherwise by sonner data-type (direct toast.* calls included). */
function toastSound(toast: HTMLElement): SoundName {
  if (toast.classList.contains('aapm-toast--blocking'))
    return 'blocked'
  const type = toast.getAttribute('data-type')
  return type === 'success' ? 'success' : type === 'error' ? 'error' : 'notify'
}

export function setupSound() {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined')
    return
  const unlock = () => sound.unlock()
  window.addEventListener('pointerdown', unlock, { once: true, capture: true })
  window.addEventListener('keydown', unlock, { once: true, capture: true })

  document.addEventListener('click', (e) => {
    if ((e.target as HTMLElement | null)?.closest?.(TICK))
      sound.play('tick')
  }, { capture: true })

  new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement))
          return
        const toast = node.matches('[data-sonner-toast]') ? node : node.querySelector<HTMLElement>('[data-sonner-toast]')
        if (toast)
          sound.play(toastSound(toast))
        if (node.matches('[role="dialog"], [role="alertdialog"]') || node.querySelector('[data-slot="dialog-content"], [data-slot="alert-dialog-content"]'))
          sound.play('pop')
      })
    }
  }).observe(document.body, { childList: true, subtree: true })
}
