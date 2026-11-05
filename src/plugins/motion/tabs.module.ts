/**
 * Sliding tab indicator: every shadcn-vue `[data-slot=tabs-list]` gets one indicator element that
 * glides to the active `[data-slot=tabs-trigger]` (translate + size, 320ms emphasis curve).
 * components/ui/tabs stays stock — the active trigger's own background is handed to the indicator
 * via `[data-aapm-tabs]` in assets/motion.css (light-theme contrast in assets/motion/controls.css).
 */
import type { MotionModule } from './types'

const INDICATOR = 'data-aapm-tab-indicator'
const lists = new WeakMap<HTMLElement, { indicator: HTMLElement, ro: ResizeObserver, mo: MutationObserver }>()
let installed = false

function place(list: HTMLElement, indicator: HTMLElement, animate: boolean) {
  const active = list.querySelector<HTMLElement>('[data-slot="tabs-trigger"][data-state="active"]')
  if (!active) {
    indicator.style.opacity = '0'
    return
  }
  if (!animate)
    indicator.style.transition = 'none'
  indicator.style.opacity = '1'
  indicator.style.width = `${active.offsetWidth}px`
  indicator.style.height = `${active.offsetHeight}px`
  indicator.style.translate = `${active.offsetLeft}px ${active.offsetTop}px`
  if (!animate)
    requestAnimationFrame(() => (indicator.style.transition = ''))
}

export function enhanceTabs(list: HTMLElement): void {
  if (lists.has(list))
    return
  const indicator = document.createElement('span')
  indicator.setAttribute(INDICATOR, '')
  indicator.setAttribute('aria-hidden', 'true')
  list.setAttribute('data-aapm-tabs', '')
  list.prepend(indicator)
  place(list, indicator, false)

  const ro = new ResizeObserver(() => place(list, indicator, false))
  ro.observe(list)
  const mo = new MutationObserver(() => place(list, indicator, true))
  mo.observe(list, { attributes: true, attributeFilter: ['data-state'], subtree: true })
  lists.set(list, { indicator, ro, mo })
}

function scan(root: Element) {
  if (root.matches('[data-slot="tabs-list"]'))
    enhanceTabs(root as HTMLElement)
  root.querySelectorAll<HTMLElement>('[data-slot="tabs-list"]').forEach(enhanceTabs)
}

const setupTabIndicator: MotionModule = () => {
  if (installed || typeof document === 'undefined' || typeof MutationObserver === 'undefined'
    || typeof ResizeObserver === 'undefined' || !document.body) {
    return
  }
  installed = true
  scan(document.body)
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node instanceof Element)
          scan(node)
      })
    }
  }).observe(document.body, { childList: true, subtree: true })
}

export default setupTabIndicator
