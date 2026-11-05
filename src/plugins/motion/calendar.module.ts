/**
 * Pickers (motion v2, Task 10): calendar & range calendar, tags input, number field.
 *
 * - Month change: the grid slides in the direction of travel (±12px + fade, 240ms) and the heading
 *   crossfades. Direction comes from the first in-month cell's `data-value` (ISO date) before and
 *   after the change, so prev/next buttons, PageUp/PageDown, arrow keys across a month edge and the
 *   month/year dropdowns all read the same. `data-aapm-dir="next|prev"` lands on the calendar root.
 *   Rapid changes cancel the running slide — no stacked offsets.
 * - Selected day pops only when it BECOMES selected (an existing cell gaining `data-selected`),
 *   never when a month re-renders with a selection in it: `data-aapm-pop` for one animation.
 * - Range: once the range has an end, its cells get `--aapm-ri` (order) and the root carries
 *   `data-aapm-sweep` for one sweep; start / end cells get `data-aapm-range-end="start|end"`.
 * - Tags input: the tag list gets auto-animate (chips pop in, collapse out, neighbours slide).
 * - Number field: on step (buttons, arrow keys, wheel) the value rolls up or down through a
 *   short-lived aria-hidden overlay; the input itself never moves.
 *
 * Styling in assets/motion/pickers.css. components/ui stays stock — reka attributes only.
 */
import autoAnimate from '@formkit/auto-animate'

import type { MotionModule } from './types'

const ROOT = '[data-slot="calendar"], [data-slot="range-calendar"]'
const GRID = '[data-slot="calendar-grid"], [data-slot="range-calendar-grid"]'
const HEADING = '[data-slot="calendar-heading"], [data-slot="range-calendar-heading"]'
const CELL = '[data-reka-calendar-cell-trigger]'
const RANGE_CELL = '[data-slot="range-calendar-cell"]'
/** reka TagsInputItem: the only element carrying aria-current + aria-labelledby + data-state. */
const TAG_ITEM = '[aria-current][aria-labelledby][data-state]'
const SPIN = 'input[role="spinbutton"]'

export const SLIDE_MS = 240
export const SLIDE_PX = 12
const POP_MS = 320
const SWEEP_MS = 600
const ROLL_MS = 200
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)' // --aapm-ease-emphasis

let installed = false
/** Per calendar root: the month it shows (`YYYY-MM` of its first in-month cell). */
const months = new WeakMap<Element, string>()
const slides = new WeakMap<Element, Animation[]>()
const tagLists = new WeakSet<Element>()
const timers = new WeakMap<Element, ReturnType<typeof setTimeout>>()

function reducedMotion(): boolean {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function flag(el: Element, attr: string, value: string, ms: number) {
  el.setAttribute(attr, value)
  clearTimeout(timers.get(el))
  timers.set(el, setTimeout(() => el.removeAttribute(attr), ms))
}

/** `YYYY-MM` shown by a calendar root, from its first cell that is not outside the view. */
export function monthOf(root: Element): string | undefined {
  const cell = root.querySelector(`${CELL}:not([data-outside-view])`) ?? root.querySelector(CELL)
  return cell?.getAttribute('data-value')?.slice(0, 7)
}

/** Slide the grid(s) and crossfade the heading for a month change in `dir`. */
export function slideMonth(root: Element, dir: 'next' | 'prev'): void {
  root.setAttribute('data-aapm-dir', dir)
  if (reducedMotion())
    return
  slides.get(root)?.forEach(a => a.cancel())
  const from = dir === 'next' ? SLIDE_PX : -SLIDE_PX
  const running: Animation[] = []
  root.querySelectorAll<HTMLElement>(GRID).forEach((grid) => {
    if (typeof grid.animate === 'function') {
      running.push(grid.animate(
        [{ translate: `${from}px 0`, opacity: 0.4 }, { translate: '0 0', opacity: 1 }],
        { duration: SLIDE_MS, easing: EASE },
      ))
    }
  })
  root.querySelectorAll<HTMLElement>(HEADING).forEach((heading) => {
    if (typeof heading.animate === 'function') {
      running.push(heading.animate(
        [{ translate: `${from / 2}px 0`, opacity: 0 }, { translate: '0 0', opacity: 1 }],
        { duration: SLIDE_MS - 40, easing: EASE },
      ))
    }
  })
  // A cancelled slide rejects `finished`; that is expected, not an error.
  running.forEach(a => a.finished.catch(() => {}))
  slides.set(root, running)
}

function checkMonth(root: Element) {
  const month = monthOf(root)
  if (!month)
    return
  const before = months.get(root)
  months.set(root, month)
  if (before && before !== month)
    slideMonth(root, month > before ? 'next' : 'prev')
}

/** Index the selected range cells in order and flag one sweep; mark the two ends. */
export function sweepRange(root: Element): void {
  const cells = Array.from(root.querySelectorAll<HTMLElement>(RANGE_CELL))
    .filter(td => td.querySelector('[data-selected]'))
  cells.forEach((td, i) => {
    td.style.setProperty('--aapm-ri', String(Math.min(i, 30)))
    const trigger = td.querySelector(CELL)
    if (trigger?.hasAttribute('data-selection-start'))
      td.setAttribute('data-aapm-range-end', 'start')
    else if (trigger?.hasAttribute('data-selection-end'))
      td.setAttribute('data-aapm-range-end', 'end')
    else
      td.removeAttribute('data-aapm-range-end')
  })
  if (cells.length > 1 && !reducedMotion())
    flag(root, 'data-aapm-sweep', '', SWEEP_MS)
}

function enhanceTags(item: Element) {
  const list = item.parentElement
  if (!list || tagLists.has(list) || reducedMotion())
    return
  tagLists.add(list)
  autoAnimate(list, { duration: 220, easing: EASE })
}

/** Roll the spinbutton's value: the old number leaves in `dir`, the new one arrives from the other side. */
export function rollNumber(input: HTMLInputElement, before: string, dir: 'up' | 'down'): void {
  const after = input.value
  if (reducedMotion() || before === after || !input.parentElement)
    return
  const host = input.parentElement
  if (getComputedStyle(host).position === 'static')
    host.style.position = 'relative'
  const cs = getComputedStyle(input)
  const lane = document.createElement('span')
  lane.setAttribute('aria-hidden', 'true')
  lane.setAttribute('data-aapm-roll', '')
  Object.assign(lane.style, {
    left: `${input.offsetLeft}px`,
    top: `${input.offsetTop}px`,
    width: `${input.offsetWidth}px`,
    height: `${input.offsetHeight}px`,
    font: cs.font,
    letterSpacing: cs.letterSpacing,
    justifyContent: cs.textAlign === 'center' ? 'center' : cs.textAlign === 'right' || cs.textAlign === 'end' ? 'flex-end' : 'flex-start',
    paddingInline: `${cs.paddingLeft} ${cs.paddingRight}`,
  })
  const out = document.createElement('span')
  const inn = document.createElement('span')
  out.textContent = before
  inn.textContent = after
  lane.append(out, inn)
  host.append(lane)
  input.setAttribute('data-aapm-rolling', '')
  const shift = dir === 'up' ? -1 : 1
  const opts: KeyframeAnimationOptions = { duration: ROLL_MS, easing: EASE, fill: 'both' }
  out.animate([{ translate: '0 0', opacity: 1 }, { translate: `0 ${shift * 70}%`, opacity: 0 }], opts)
  const last = inn.animate([{ translate: `0 ${-shift * 70}%`, opacity: 0 }, { translate: '0 0', opacity: 1 }], opts)
  const done = () => {
    lane.remove()
    if (!host.querySelector('[data-aapm-roll]'))
      input.removeAttribute('data-aapm-rolling')
  }
  last.finished.then(done, done)
}

function stepAndRoll(input: HTMLInputElement, dir: 'up' | 'down') {
  const before = input.value
  // reka updates the value in its own handler; read it after the patch.
  requestAnimationFrame(() => rollNumber(input, before, dir))
}

function scan(node: Element) {
  const roots = node.matches(ROOT) ? [node] : Array.from(node.querySelectorAll(ROOT))
  roots.forEach((root) => {
    if (!months.has(root)) {
      const month = monthOf(root)
      if (month)
        months.set(root, month)
    }
  })
  if (node.matches(TAG_ITEM))
    enhanceTags(node)
  node.querySelectorAll(TAG_ITEM).forEach(enhanceTags)
}

const setupPickers: MotionModule = () => {
  if (installed || typeof document === 'undefined' || typeof MutationObserver === 'undefined' || !document.body)
    return
  installed = true
  scan(document.body)

  new MutationObserver((records) => {
    const touched = new Set<Element>()
    const ranges = new Set<Element>()
    const pops = new Set<Element>()
    /** Cells reka re-used for another date in this batch (month patch, not a user selection). */
    const revalued = new Set<Element>()
    /** Subtrees mounted in this batch: their selected cells are a render, not a selection. */
    const added: Element[] = []
    for (const record of records) {
      const target = record.target instanceof Element ? record.target : record.target.parentElement
      if (!target)
        continue
      if (record.type === 'childList') {
        record.addedNodes.forEach((n) => {
          if (n instanceof Element) {
            added.push(n)
            scan(n)
          }
        })
      }
      const root = target.closest(ROOT)
      if (!root)
        continue
      touched.add(root)
      if (record.type !== 'attributes' || !target.matches(CELL))
        continue
      const name = record.attributeName
      if (name === 'data-value') {
        revalued.add(target)
        continue
      }
      const gained = target.hasAttribute(name ?? '') && record.oldValue === null
      // An existing cell that just became selected (not a fresh month render): pop it.
      if (gained && name === 'data-selected' && root.matches('[data-slot="calendar"]'))
        pops.add(target)
      if (gained && (name === 'data-selection-start' || name === 'data-selection-end'))
        pops.add(target)
      if (gained && name === 'data-selection-end')
        ranges.add(root)
    }
    pops.forEach((cell) => {
      if (!revalued.has(cell) && !added.some(n => n.contains(cell)))
        flag(cell, 'data-aapm-pop', '', POP_MS)
    })
    touched.forEach(checkMonth)
    ranges.forEach(sweepRange)
  }).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['data-selected', 'data-selection-start', 'data-selection-end', 'data-value'],
  })

  // Number field steps: buttons, arrow keys, wheel.
  document.addEventListener('pointerdown', (event) => {
    if (!(event.target instanceof Element))
      return
    const button = event.target.closest('[data-slot="increment"], [data-slot="decrement"]')
    const input = button?.closest('[role="group"]')?.querySelector<HTMLInputElement>(SPIN)
    if (button && input && !button.matches('[data-disabled], :disabled'))
      stepAndRoll(input, button.matches('[data-slot="increment"]') ? 'up' : 'down')
  }, { passive: true })
  document.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement && event.target.matches(SPIN)
      && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'PageUp' || event.key === 'PageDown')) {
      stepAndRoll(event.target, event.key === 'ArrowUp' || event.key === 'PageUp' ? 'up' : 'down')
    }
  })
  document.addEventListener('wheel', (event) => {
    if (event.target instanceof HTMLInputElement && event.target.matches(SPIN) && document.activeElement === event.target)
      stepAndRoll(event.target, event.deltaY < 0 ? 'up' : 'down')
  }, { passive: true })
}

export default setupPickers
