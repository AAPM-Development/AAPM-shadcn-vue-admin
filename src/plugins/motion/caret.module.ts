/**
 * Smooth caret: attaches `attachSmoothCaret` to every single-line shadcn Input and PinInput slot,
 * at start-up and whenever one mounts, and detaches it when the field leaves the document.
 * Fields stay stock; per-field conditions (readonly, disabled, IME, zoom…) live in the composable.
 */
import { attachSmoothCaret } from '@/composables/use-smooth-caret'

import type { MotionModule } from './types'

const FIELDS = `input[data-slot='input'], input[data-slot='pin-input-slot']`
const TEXT_TYPES = new Set(['text', 'search', 'email', 'password', 'tel', 'url', 'number'])

const attached = new Map<HTMLInputElement, () => void>()
let installed = false

function attach(el: Element) {
  if (el instanceof HTMLInputElement && TEXT_TYPES.has(el.type) && !attached.has(el))
    attached.set(el, attachSmoothCaret(el))
}

function scan(root: ParentNode) {
  if (root instanceof Element && root.matches(FIELDS))
    attach(root)
  root.querySelectorAll(FIELDS).forEach(attach)
}

/** Detach fields Vue removed (v-if, route change, KeepAlive deactivation). */
function sweep() {
  attached.forEach((detach, el) => {
    if (!el.isConnected) {
      detach()
      attached.delete(el)
    }
  })
}

const setupSmoothCaret: MotionModule = () => {
  if (installed || typeof document === 'undefined' || typeof MutationObserver === 'undefined')
    return
  installed = true
  scan(document)
  new MutationObserver((mutations) => {
    let removed = false
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element)
          scan(node)
      })
      removed ||= Array.from(mutation.removedNodes).some(node => node instanceof Element)
    }
    if (removed)
      sweep()
  }).observe(document.body, { childList: true, subtree: true })
}

export default setupSmoothCaret
