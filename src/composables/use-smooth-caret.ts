/**
 * Smooth caret for single-line fields (AAPM motion v2, "Smooth caret").
 *
 * - A decorative 2px overlay (`[data-aapm-caret]`, aria-hidden) glides to the caret position.
 *   The native caret is hidden by CSS only while the input carries `data-aapm-caret-host`, which
 *   is set only while the overlay stands in for it; IME composition, range selections that
 *   collapse, unmeasurable positions and every "inactive" condition give the native caret back.
 * - The overlay lives in the input's parent (made `position: relative` only if it was static), so
 *   it scrolls and moves with the field without any scroll listener. It is inserted so that the
 *   input's own :first-child / :last-child state never changes (pin slots, button groups).
 * - Measurement reuses one off-screen mirror span for every input and runs at most once per frame.
 * - Inactive (native caret only) for readonly / disabled fields, reduced motion, forced colours,
 *   pinch zoom >= 200%, right-to-left text and types without `selectionStart` (email, number).
 */
import type { MotionValue } from 'motion-v'

import { animate, motionValue } from 'motion-v'

import { AAPM_EASE, prefersReducedMotion } from '@/components/aapm/motion/easing'
import { sound } from '@/lib/sound'

const CARET_WIDTH = 2
const GLIDE_S = 0.09
const PULSE_S = 0.12
const FLICK_S = 0.16
const GHOST_MS = 160
const IDLE_MS = 600
/** Sub-pixel slack between mirror metrics and the browser's own scroll-into-view. */
const EDGE_TOLERANCE = 2
/** Chromium / WebKit password mask character. */
const BULLET = '•'
/** Computed properties that change text advance widths. */
const TEXT_METRICS = [
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'font-stretch',
  'font-variant',
  'font-feature-settings',
  'font-variation-settings',
  'font-kerning',
  'letter-spacing',
  'word-spacing',
  'text-transform',
  'text-rendering',
]

type Controls = ReturnType<typeof animate>
type Timer = ReturnType<typeof setTimeout>

const px = (value: string) => Number.parseFloat(value) || 0

/** Text as painted: password fields show one bullet per character, never the secret. */
function paintedText(input: HTMLInputElement, end: number) {
  const text = input.value.slice(0, end)
  return input.type === 'password' ? BULLET.repeat(Array.from(text).length) : text
}

/** Replace the mirror text in place (characterData, not childList, so DOM observers stay quiet). */
function measureText(mirror: HTMLElement, text: string) {
  const node = mirror.firstChild
  if (node && node.nodeType === Node.TEXT_NODE && !node.nextSibling)
    (node as Text).data = text
  else
    mirror.textContent = text
  return mirror.getBoundingClientRect()
}

function alignment(textAlign: string): 'start' | 'center' | 'end' {
  if (textAlign === 'center' || textAlign === '-webkit-center')
    return 'center'
  if (textAlign === 'right' || textAlign === 'end' || textAlign === '-webkit-right')
    return 'end'
  return 'start'
}

/**
 * Caret position for `index` in px from the input's left padding edge, after `scrollLeft`,
 * clamped to the content box. `visible` is false when the real caret is scrolled out of view.
 */
export function measureCaret(input: HTMLInputElement, index: number, mirror: HTMLElement): { x: number, height: number, visible: boolean } {
  const style = getComputedStyle(input)
  for (const prop of TEXT_METRICS)
    mirror.style.setProperty(prop, style.getPropertyValue(prop))
  mirror.style.whiteSpace = 'pre'
  mirror.style.lineHeight = 'normal'

  const left = px(style.paddingLeft)
  const right = Math.max(left, input.clientWidth - px(style.paddingRight))
  let offset = 0
  const align = alignment(style.textAlign)
  if (align !== 'start') {
    // Centred / end-aligned text only shifts while it fits; overflowing text starts at the edge.
    const free = Math.max(0, right - left - measureText(mirror, paintedText(input, input.value.length)).width)
    offset = align === 'center' ? free / 2 : free
  }

  const text = paintedText(input, Math.max(0, Math.min(index, input.value.length)))
  // An empty mirror has no line box: a zero-width space lends the caret its line height.
  const lineHeight = text ? 0 : measureText(mirror, '​').height
  const box = measureText(mirror, text)

  const raw = left + offset + box.width - input.scrollLeft
  return {
    x: Math.min(Math.max(raw, left), right),
    height: box.height || lineHeight || px(style.fontSize) * 1.2,
    visible: raw >= left - EDGE_TOLERANCE && raw <= right + EDGE_TOLERANCE,
  }
}

let sharedMirror: HTMLSpanElement | null = null

function mirrorElement() {
  if (!sharedMirror) {
    sharedMirror = document.createElement('span')
    sharedMirror.setAttribute('data-aapm-caret-mirror', '')
    sharedMirror.setAttribute('aria-hidden', 'true')
    Object.assign(sharedMirror.style, {
      position: 'fixed',
      top: '0',
      left: '-10000px',
      visibility: 'hidden',
      pointerEvents: 'none',
      whiteSpace: 'pre',
    })
  }
  if (!sharedMirror.isConnected)
    document.body.append(sharedMirror)
  return sharedMirror
}

/** Parents this module switched from `static` to `relative`, shared by every input inside. */
const claimedParents = new WeakMap<HTMLElement, { count: number, previous: string }>()
const instances = new WeakMap<HTMLInputElement, () => void>()

/** Keep a positioned input (pin slot, focused button-group item) from painting over the layer. */
function layerAbove(style: CSSStyleDeclaration) {
  const z = Number.parseInt(style.zIndex, 10)
  return Number.isNaN(z) ? '' : String(z + 1)
}

function decorate<T extends HTMLElement>(el: T, name: string): T {
  el.setAttribute(name, '')
  el.setAttribute('aria-hidden', 'true')
  Object.assign(el.style, { position: 'absolute', left: '0', top: '0', margin: '0', pointerEvents: 'none' })
  return el
}

/** Attach the smooth caret to one input. Idempotent; returns a detach function. */
export function attachSmoothCaret(input: HTMLInputElement): () => void {
  const existing = instances.get(input)
  if (existing)
    return existing

  let overlay: HTMLSpanElement | null = null
  let bar: HTMLSpanElement | null = null
  let x: MotionValue<number> | null = null
  let glide: Controls | null = null
  let target = Number.NaN
  let claimed: HTMLElement | null = null
  let raf = 0
  let idle: Timer | undefined
  let focused = false
  let composing = false
  let shown = false
  let lastValue = input.value
  const ghosts = new Map<HTMLElement, Timer>()
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => schedule())

  function active() {
    if (input.disabled || input.readOnly || input.selectionStart === null)
      return false
    if (prefersReducedMotion())
      return false
    if (typeof window.matchMedia === 'function' && window.matchMedia('(forced-colors: active)').matches)
      return false
    if ((window.visualViewport?.scale ?? 1) >= 2)
      return false
    return getComputedStyle(input).direction !== 'rtl'
  }

  function schedule() {
    if (focused && !raf)
      raf = requestAnimationFrame(update)
  }

  function nativeCaret(visible: boolean) {
    input.toggleAttribute('data-aapm-caret-host', !visible)
  }

  function hide(restoreNative = true) {
    shown = false
    clearTimeout(idle)
    overlay?.setAttribute('data-hidden', 'true')
    overlay?.removeAttribute('data-blink')
    if (restoreNative)
      nativeCaret(true)
  }

  function claimParent(host: HTMLElement) {
    const entry = claimedParents.get(host)
    if (entry) {
      entry.count += 1
      claimed = host
    }
    else if (getComputedStyle(host).position === 'static') {
      claimedParents.set(host, { count: 1, previous: host.style.position })
      host.style.position = 'relative'
      claimed = host
    }
  }

  function releaseParent() {
    const entry = claimed && claimedParents.get(claimed)
    if (claimed && entry) {
      entry.count -= 1
      if (entry.count === 0) {
        claimed.style.position = entry.previous
        claimedParents.delete(claimed)
      }
    }
    claimed = null
  }

  /** Create the overlay on first use and keep it next to the input. */
  function mount(): HTMLSpanElement | null {
    const host = input.parentElement
    if (!host)
      return null
    if (!overlay) {
      overlay = decorate(document.createElement('span'), 'data-aapm-caret')
      overlay.setAttribute('data-hidden', 'true')
      bar = document.createElement('span')
      bar.setAttribute('data-aapm-caret-bar', '')
      overlay.append(bar)
      x = motionValue(0)
      x.on('change', paint)
    }
    if (overlay.parentElement !== host) {
      releaseParent()
      claimParent(host)
      // Before the input, unless it is the first of several children: then right after it.
      const anchor = !input.previousElementSibling && input.nextElementSibling ? input.nextSibling : input
      host.insertBefore(overlay, anchor)
    }
    return overlay
  }

  function paint(value: number) {
    if (overlay)
      overlay.style.transform = `translateX(${value}px)`
  }

  function moveTo(next: number, instant: boolean) {
    if (!x)
      return
    if (instant) {
      glide?.stop()
      glide = null
      x.jump(next)
      paint(next)
    }
    else if (next !== target) {
      glide = animate(x, next, { duration: GLIDE_S, ease: AAPM_EASE.emphasis })
    }
    target = next
  }

  /** Border-box offset of the input inside the layer's containing block. */
  function inputOffset(layer: HTMLElement) {
    const box = layer.offsetParent as HTMLElement | null
    if (box && input.offsetParent === box)
      return { left: input.offsetLeft, top: input.offsetTop }
    const from = input.getBoundingClientRect()
    const to = (box ?? document.documentElement).getBoundingClientRect()
    return {
      left: from.left - to.left - (box?.clientLeft ?? 0) + (box?.scrollLeft ?? 0),
      top: from.top - to.top - (box?.clientTop ?? 0) + (box?.scrollTop ?? 0),
    }
  }

  function restartIdle() {
    clearTimeout(idle)
    overlay?.removeAttribute('data-blink')
    idle = setTimeout(() => overlay?.setAttribute('data-blink', 'true'), IDLE_MS)
  }

  function update() {
    raf = 0
    lastValue = input.value
    const layer = focused && !composing && active() ? mount() : null
    const start = input.selectionStart
    if (!layer || start === null) {
      hide()
      return
    }
    if (start !== input.selectionEnd) {
      // No caret is painted with a range; keep the native one off so it cannot flash on collapse.
      hide(false)
      nativeCaret(false)
      return
    }

    const caret = measureCaret(input, start, mirrorElement())
    if (!caret.visible) {
      // Scrolled out of view, or metrics disagree: let the native caret take over.
      hide()
      return
    }

    const style = getComputedStyle(input)
    const padTop = px(style.paddingTop)
    const content = input.clientHeight - padTop - px(style.paddingBottom)
    const height = content > 0 ? Math.min(caret.height, content) : caret.height
    const at = inputOffset(layer)
    layer.style.left = `${at.left + input.clientLeft - CARET_WIDTH / 2}px`
    layer.style.top = `${at.top + input.clientTop + padTop + Math.max(0, content - height) / 2}px`
    layer.style.height = `${height}px`
    layer.style.zIndex = layerAbove(style)

    moveTo(caret.x, !shown)
    shown = true
    layer.removeAttribute('data-hidden')
    nativeCaret(false)
    restartIdle()
  }

  function dropGhost(ghost: HTMLElement) {
    clearTimeout(ghosts.get(ghost))
    ghosts.delete(ghost)
    ghost.remove()
  }

  /** The placeholder slides 4px right and fades instead of vanishing on the first character. */
  function ghostPlaceholder() {
    const layer = mount()
    const host = input.parentElement
    if (!input.placeholder || !layer || !host)
      return
    const style = getComputedStyle(input)
    const padLeft = px(style.paddingLeft)
    const padTop = px(style.paddingTop)
    const width = Math.max(0, input.clientWidth - padLeft - px(style.paddingRight))
    const height = Math.max(0, input.clientHeight - padTop - px(style.paddingBottom))
    const at = inputOffset(layer)

    const ghost = decorate(document.createElement('span'), 'data-aapm-caret-ghost')
    ghost.textContent = input.placeholder
    for (const prop of TEXT_METRICS)
      ghost.style.setProperty(prop, style.getPropertyValue(prop))
    Object.assign(ghost.style, {
      left: `${at.left + input.clientLeft + padLeft}px`,
      top: `${at.top + input.clientTop + padTop}px`,
      width: `${width}px`,
      height: `${height}px`,
      lineHeight: `${height}px`,
      textAlign: style.textAlign,
      whiteSpace: 'pre',
      overflow: 'hidden',
      zIndex: layerAbove(style),
    })
    host.insertBefore(ghost, layer)
    ghosts.set(ghost, setTimeout(dropGhost, GHOST_MS, ghost))
  }

  function onInput(event: Event) {
    const value = input.value
    const wasEmpty = lastValue === ''
    lastValue = value
    const { inputType = '', isComposing = false } = event as InputEvent
    if (focused && !composing && !isComposing && active()) {
      if (wasEmpty && value !== '')
        ghostPlaceholder()
      if (inputType.startsWith('delete') && bar) {
        animate(bar, { scaleY: [0.7, 1] }, { duration: PULSE_S, ease: AAPM_EASE.out })
        if (value === '' && !wasEmpty) {
          animate(bar, { x: [-3, 0] }, { duration: FLICK_S, ease: AAPM_EASE.emphasis })
          sound.play('tick')
        }
      }
    }
    schedule()
  }

  function onSelectionChange() {
    if (document.activeElement === input)
      schedule()
  }

  function onFocus() {
    if (focused)
      return
    focused = true
    lastValue = input.value
    document.addEventListener('selectionchange', onSelectionChange)
    resize?.observe(input)
    schedule()
  }

  function stopTracking() {
    focused = false
    composing = false
    if (raf)
      cancelAnimationFrame(raf)
    raf = 0
    document.removeEventListener('selectionchange', onSelectionChange)
    resize?.disconnect()
  }

  function onBlur() {
    stopTracking()
    hide()
  }

  function onCompositionStart() {
    composing = true
    hide()
  }

  function onCompositionEnd() {
    composing = false
    lastValue = input.value
    schedule()
  }

  const listeners: Array<[string, EventListener]> = [
    ['focus', onFocus],
    ['blur', onBlur],
    ['input', onInput],
    ['keydown', schedule],
    ['keyup', schedule],
    ['select', schedule],
    ['compositionstart', onCompositionStart],
    ['compositionend', onCompositionEnd],
  ]
  listeners.forEach(([type, fn]) => input.addEventListener(type, fn))

  function detach() {
    instances.delete(input)
    listeners.forEach(([type, fn]) => input.removeEventListener(type, fn))
    stopTracking()
    clearTimeout(idle)
    glide?.stop()
    x?.destroy()
    ghosts.forEach((_, ghost) => dropGhost(ghost))
    overlay?.remove()
    overlay = null
    bar = null
    x = null
    glide = null
    releaseParent()
    nativeCaret(true)
  }

  instances.set(input, detach)
  if (document.activeElement === input)
    onFocus()
  return detach
}
