/**
 * Global layout stability (motion v2 — "UI must not jump: adding a row, changing a filter,
 * a button appearing").
 *
 * 1. Content below glides. Every flow block (card, table container, table, list, form, tab panel)
 *    is watched by one ResizeObserver. When a block's height changes by Δ, everything that sits
 *    after it in the flow — its later siblings, then its ancestors' later siblings up to <main> —
 *    is FLIP-ed: a WAAPI `translate: 0 -Δ → 0` with `composite: 'add'`, so back-to-back changes
 *    stack instead of snapping. Deepest block wins; an ancestor that grew because of it is skipped.
 * 2. Newcomers ease in. Flex rows of buttons and plain table bodies get @formkit/auto-animate, so a
 *    button / row that appears fades in while its neighbours slide aside.
 *
 * Skipped: reduced motion, width changes (viewport resize), blocks mounted < GRACE_MS ago (first
 * paint, route change), areas that already animate their own height (collapsible, accordion,
 * AutoHeight) or their children (TransitionGroup tables marked `data-aapm-staged`), portals and
 * menus, and anything under `[data-aapm-stable="off"]`. Pages and components/ui stay untouched.
 */
import autoAnimate from '@formkit/auto-animate'

import type { MotionModule } from './types'

const BLOCKS = [
  '[data-slot="card"]',
  '[data-slot="table-container"]',
  'table',
  'ol',
  'ul',
  'form',
  '[data-slot="tabs-content"]',
  '[data-slot="field"]',
].join(', ')

/** Never observe or animate inside these: they own their motion, or live outside the page flow. */
const OWN_MOTION = [
  '[data-slot="collapsible-content"]',
  '[data-slot="accordion-content"]',
  '[data-slot="auto-height"]',
  '[data-sidebar]',
  '[data-radix-popper-content-wrapper]',
  '[data-reka-popper-content-wrapper]',
  '[role="dialog"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[data-sonner-toaster]',
  '[data-aapm-stable="off"]',
].join(', ')

/** Children of these never get auto-animate (indicators, pills and staged lists of their own). */
const NO_AUTO_ANIMATE = [
  '[role="tablist"]',
  '[role="radiogroup"]',
  '[role="toolbar"][data-orientation]',
  '[data-slot="toggle-group"]',
  '[data-slot="pagination-content"]',
  '[data-slot="calendar"]',
  '[data-slot="range-calendar"]',
  '[data-aapm-staged]',
  '[data-aapm-menu]',
  // Row actions inside cells never come and go per row; one auto-animate per row would be waste.
  'td',
  'th',
].join(', ')

export const GRACE_MS = 600
export const GLIDE_MS = 360
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)' // --aapm-ease-emphasis
/** Ignore sub-pixel jitter and huge jumps (a whole page swap is not a "shift"). */
const MIN_DELTA = 2
const MAX_DELTA = 900
/** Large parents are left alone: auto-animate measures every child on each change. */
const MAX_CHILDREN = 60

interface Box { height: number, width: number, since: number }

let installed = false
const boxes = new WeakMap<Element, Box>()
const animated = new WeakSet<Element>()
let resizeObserver: ResizeObserver | undefined

function reducedMotion(): boolean {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function inFlow(el: Element): boolean {
  if (!(el instanceof HTMLElement) || el.closest(OWN_MOTION))
    return false
  const { position, display } = getComputedStyle(el)
  return display !== 'none' && display !== 'contents' && position !== 'absolute' && position !== 'fixed'
}

function onScreen(el: Element): boolean {
  const r = el.getBoundingClientRect()
  return r.bottom > -40 && r.top < window.innerHeight + 40
}

/**
 * Elements that move when `block` changes height: later siblings that sit below it, walking up
 * the ancestor chain to <main> (or <body>). Exported for tests.
 */
export function followersOf(block: Element): HTMLElement[] {
  const out: HTMLElement[] = []
  let node: Element | null = block
  while (node && node !== document.body && node.tagName !== 'MAIN') {
    const anchorBottom = node.getBoundingClientRect().bottom
    let sib = node.nextElementSibling
    while (sib) {
      // Only what sits below the changed block moves; a side-by-side column does not.
      if (inFlow(sib) && sib.getBoundingClientRect().top >= anchorBottom - 1 && onScreen(sib))
        out.push(sib as HTMLElement)
      sib = sib.nextElementSibling
    }
    node = node.parentElement
  }
  return out
}

/** Slide `el` from where it was (Δ above / below) to where it is now. */
export function glide(el: HTMLElement, delta: number): void {
  if (typeof el.animate !== 'function')
    return
  el.animate(
    [{ translate: `0 ${-delta}px` }, { translate: '0 0' }],
    { duration: GLIDE_MS, easing: EASE, composite: 'add' },
  )
}

const HEIGHT_ANIMATORS = '[data-slot="collapsible-content"], [data-slot="accordion-content"], [data-slot="auto-height"], [data-slot="navigation-menu-viewport"]'

/**
 * A block whose height is being animated from inside (AutoHeight, collapsible, accordion) already
 * moves the content below smoothly, frame by frame — gliding on top of that would double it.
 */
function animatingInside(el: Element): boolean {
  if (el.querySelector('[data-slot="auto-height"][style*="height"]'))
    return true
  if (typeof el.getAnimations !== 'function')
    return false
  return el.getAnimations({ subtree: true }).some((a) => {
    const target = (a.effect as KeyframeEffect | null)?.target
    return target instanceof Element && target.matches(HEIGHT_ANIMATORS)
  })
}

function onResize(entries: ResizeObserverEntry[]) {
  const now = performance.now()
  const reduce = reducedMotion()
  // Deepest first: a block that changed explains its ancestors' change too.
  const changed: { el: Element, delta: number }[] = []
  for (const entry of entries) {
    const el = entry.target
    const box = boxes.get(el)
    const height = (el as HTMLElement).offsetHeight
    const width = (el as HTMLElement).offsetWidth
    if (!box) {
      boxes.set(el, { height, width, since: now })
      continue
    }
    const delta = height - box.height
    const widthChanged = Math.abs(width - box.width) > 1
    box.height = height
    box.width = width
    if (reduce || widthChanged || now - box.since < GRACE_MS)
      continue
    if (Math.abs(delta) >= MIN_DELTA && Math.abs(delta) <= MAX_DELTA)
      changed.push({ el, delta })
  }
  if (!changed.length)
    return
  changed.sort((a, b) => depth(b.el) - depth(a.el))
  const explained = new Set<Element>()
  for (const { el, delta } of changed) {
    if (explained.has(el) || !el.isConnected)
      continue
    for (let p = el.parentElement; p; p = p.parentElement)
      explained.add(p)
    if (animatingInside(el))
      continue
    followersOf(el).forEach(f => glide(f, delta))
  }
}

function depth(el: Element): number {
  let d = 0
  for (let p = el.parentElement; p; p = p.parentElement)
    d++
  return d
}

function observe(el: Element) {
  if (boxes.has(el) || el.closest(OWN_MOTION) || !resizeObserver)
    return
  boxes.set(el, { height: (el as HTMLElement).offsetHeight, width: (el as HTMLElement).offsetWidth, since: performance.now() })
  resizeObserver.observe(el)
}

/** auto-animate a parent once, if its children are buttons / rows that may come and go. */
export function enhanceParent(parent: Element | null): void {
  if (!(parent instanceof HTMLElement) || animated.has(parent) || reducedMotion())
    return
  if (parent.closest(OWN_MOTION) || parent.closest(NO_AUTO_ANIMATE) || parent.children.length > MAX_CHILDREN)
    return
  const isBody = parent.matches('tbody')
  if (!isBody) {
    const { display } = getComputedStyle(parent)
    if (!display.includes('flex'))
      return
  }
  animated.add(parent)
  autoAnimate(parent, { duration: 240, easing: EASE })
}

function scan(root: Element) {
  if (root.matches(BLOCKS))
    observe(root)
  root.querySelectorAll(BLOCKS).forEach(observe)
  if (root.matches('button'))
    enhanceParent(root.parentElement)
  root.querySelectorAll('button').forEach(b => enhanceParent(b.parentElement))
  if (root.matches('tbody'))
    enhanceParent(root)
  root.querySelectorAll('tbody').forEach(enhanceParent)
}

const setupLayoutStability: MotionModule = () => {
  if (installed || typeof document === 'undefined' || typeof ResizeObserver === 'undefined'
    || typeof MutationObserver === 'undefined' || !document.body) {
    return
  }
  installed = true
  resizeObserver = new ResizeObserver(onResize)
  scan(document.body)
  new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element)
          scan(node)
      })
    }
  }).observe(document.body, { childList: true, subtree: true })
}

export default setupLayoutStability
