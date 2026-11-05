/**
 * Menus in sidebar style (motion v2, Task 5 → extended by Task 9 "immersive menus").
 *
 * Every open select, dropdown menu, context menu, menubar menu, combobox list and command palette
 * gets ONE `[data-aapm-menu-pill]` that glides (translate + height, 180ms emphasis — see
 * assets/motion/select.css) to the item reka-ui marks `[data-highlighted]`, wearing the sidebar's
 * `--nav-active` tint and 3px indicator bar. While a menu carries `[data-aapm-menu]`, the items' own
 * highlight background is transparent so the pill is the only highlight.
 *
 * On open, the first 8 own items get an inline `--aapm-i` (0–7) and the menu carries
 * `[data-aapm-cascade]` for one cascade (assets/motion/menus.css). Items mounted later — e.g. by
 * typing into a combobox / command filter — never get an index, so filtering does not replay it.
 *
 * components/ui stays stock: everything attaches via data-slot. One MutationObserver on
 * document.body: new menus (childList) and highlight / state changes (`data-highlighted`,
 * `data-state`) — reka portals menu content to body.
 */
import type { MotionModule } from './types'

const CONTENT_SLOTS = [
  'select-content',
  'dropdown-menu-content',
  // Sub-menus may render inside the parent's DOM; they get their own pill so the parent never
  // measures an item that lives in another (fixed-positioned) panel.
  'dropdown-menu-sub-content',
  'context-menu-content',
  'context-menu-sub-content',
  'menubar-content',
  'menubar-sub-content',
  'combobox-list',
  'command',
] as const

const ITEM_SLOTS = [
  'select-item',
  'dropdown-menu-item',
  'dropdown-menu-checkbox-item',
  'dropdown-menu-radio-item',
  'dropdown-menu-sub-trigger',
  'context-menu-item',
  'context-menu-checkbox-item',
  'context-menu-radio-item',
  'context-menu-sub-trigger',
  'menubar-item',
  'menubar-checkbox-item',
  'menubar-radio-item',
  'menubar-sub-trigger',
  'combobox-item',
  'command-item',
] as const

const slots = (names: readonly string[]) => names.map(n => `[data-slot="${n}"]`).join(', ')

const CONTENT = slots(CONTENT_SLOTS)
const ITEM = slots(ITEM_SLOTS)
/** Scrolling element inside a menu: the pill lives there so it scrolls with the items. */
const SCROLL_HOST = '[data-reka-select-viewport], [data-slot="combobox-viewport"], [data-slot="command-list"]'
const OPEN_SUB_TRIGGER = '[data-slot$="sub-trigger"][data-state="open"]'

const PILL = 'data-aapm-menu-pill'
const MENU = 'data-aapm-menu'
const HOST = 'data-aapm-menu-host'
const CASCADE = 'data-aapm-cascade'
/** Present for one style flush: the pill jumps (no translate/height transition) and only fades in. */
const SNAP = 'data-aapm-pill-snap'

/** How many leading items take part in the open cascade (16ms apart → ≤ 112ms of stagger). */
export const CASCADE_ITEMS = 8
/** Longest cascade: 60ms lead + 7 × 16ms stagger + 180ms item → under 360ms; then the flag goes. */
const CASCADE_CLEAR_MS = 400

let observer: MutationObserver | undefined
const cascadeTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>()

function reducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** The element the pill lives in: the menu's own scrolling list, else the menu content itself. */
function hostOf(content: HTMLElement): HTMLElement {
  const host = content.querySelector<HTMLElement>(SCROLL_HOST)
  return host && host.closest(CONTENT) === content ? host : content
}

function pillOf(content: HTMLElement): HTMLElement | undefined {
  return Array.from(hostOf(content).children).find((el): el is HTMLElement => el.hasAttribute(PILL))
}

/** Items of this menu only — never those of a nested sub-menu. */
function ownItems(content: HTMLElement): HTMLElement[] {
  return Array.from(content.querySelectorAll<HTMLElement>(ITEM)).filter(el => el.closest(CONTENT) === content)
}

/** Highlighted item, else a sub-trigger whose sub-menu is open (focus moved into the sub-menu). */
function targetOf(content: HTMLElement): HTMLElement | undefined {
  const items = ownItems(content)
  return items.find(el => el.hasAttribute('data-highlighted'))
    ?? items.find(el => el.matches(OPEN_SUB_TRIGGER))
}

/** Offset of `el` inside `host`, layout-based (unaffected by the panel's open scale animation). */
function offsetWithin(el: HTMLElement, host: HTMLElement): { x: number, y: number } {
  let x = 0
  let y = 0
  let node: HTMLElement | null = el
  while (node && node !== host) {
    x += node.offsetLeft
    y += node.offsetTop
    const parent: Element | null = node.offsetParent
    node = parent instanceof HTMLElement && host.contains(parent) ? parent : null
  }
  return { x, y }
}

/** Move the pill onto the highlighted item, or fade it out when nothing is highlighted. */
export function placePill(content: HTMLElement): void {
  const pill = pillOf(content)
  if (!pill)
    return
  const item = targetOf(content)
  // Destructive items keep their own red highlight (styled by components/ui); the pill steps aside.
  // A highlighted item that was filtered out (still in the DOM but hidden) has no box: hide too.
  if (!item || item.matches('[data-variant="destructive"]') || !item.isConnected || item.hidden) {
    pill.style.opacity = '0'
    return
  }
  const appearing = pill.style.opacity !== '1'
  if (appearing)
    pill.setAttribute(SNAP, '')
  const { x, y } = offsetWithin(item, hostOf(content))
  pill.style.width = `${item.offsetWidth}px`
  pill.style.height = `${item.offsetHeight}px`
  pill.style.translate = `${x}px ${y}px`
  pill.style.opacity = '1'
  if (appearing) {
    pill.getBoundingClientRect() // flush styles so the jump is committed before transitions return
    pill.removeAttribute(SNAP)
  }
}

/**
 * Index the first {@link CASCADE_ITEMS} own items and flag the menu for one open cascade.
 * Skipped under reduced motion (the CSS lives in a no-preference query anyway).
 */
export function cascadeMenu(content: HTMLElement): void {
  if (reducedMotion())
    return
  ownItems(content).slice(0, CASCADE_ITEMS).forEach((el, i) => el.style.setProperty('--aapm-i', String(i)))
  content.setAttribute(CASCADE, '')
  clearTimeout(cascadeTimers.get(content))
  cascadeTimers.set(content, setTimeout(() => content.removeAttribute(CASCADE), CASCADE_CLEAR_MS))
}

/** Give a menu its single pill (idempotent) and place it. The first enhance also cascades. */
export function enhanceMenu(content: HTMLElement): void {
  const host = hostOf(content)
  const fresh = !content.hasAttribute(MENU)
  if (!pillOf(content)) {
    const pill = document.createElement('span')
    pill.setAttribute(PILL, '')
    pill.setAttribute('aria-hidden', 'true')
    pill.style.opacity = '0'
    host.prepend(pill)
  }
  host.setAttribute(HOST, '')
  content.setAttribute(MENU, '')
  if (fresh)
    cascadeMenu(content)
  placePill(content)
}

function scan(node: HTMLElement) {
  if (node.matches(CONTENT))
    enhanceMenu(node)
  node.querySelectorAll<HTMLElement>(CONTENT).forEach(enhanceMenu)
}

const setupSelectPill: MotionModule = () => {
  if (observer || typeof document === 'undefined' || typeof MutationObserver === 'undefined' || !document.body)
    return
  scan(document.body)
  observer = new MutationObserver((records) => {
    const dirty = new Set<HTMLElement>()
    for (const record of records) {
      if (record.type === 'childList') {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement)
            scan(node)
        })
      }
      const target = record.target instanceof HTMLElement ? record.target : null
      // A kept-mounted menu re-opening (data-state closed → open) replays the cascade.
      if (target?.hasAttribute(MENU) && record.attributeName === 'data-state'
        && target.getAttribute('data-state') === 'open' && record.oldValue !== 'open') {
        cascadeMenu(target)
      }
      // Attribute change on an item, or items added / removed inside a menu → re-place its pill.
      const menu = target?.closest<HTMLElement>(CONTENT)
      if (menu?.hasAttribute(MENU))
        dirty.add(menu)
    }
    dirty.forEach(placePill)
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['data-highlighted', 'data-state', 'hidden'],
  })
}

export default setupSelectPill
