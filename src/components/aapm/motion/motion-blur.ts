/**
 * Directional motion blur — smears along the axis of travel only, never a uniform blur.
 *
 * Smoothness rules (why this file looks the way it does):
 * - Movement (transform/opacity) runs through motion's WAAPI path, on the compositor.
 * - Blur uses five *static* filters (#aapm-mb-{x|y}-{1..5}, App.vue). Changing a filter forces a
 *   re-raster, so the level switches only a handful of times per animation instead of every
 *   frame, and the layer just moves in between. Filters are removed at rest.
 */
import { animate } from 'motion-v'

import { sound } from '@/lib/sound'

import { AAPM_EASE, prefersReducedMotion } from './easing'

type Axis = 'x' | 'y'
export type BlurLevel = 0 | 1 | 2 | 3 | 4 | 5

const url = (axis: Axis, level: BlurLevel) => (level ? `url(#aapm-mb-${axis}-${level})` : '')

/**
 * Step a blur down from `peak` to none over `durationMs`, front-loaded like an ease-out curve
 * (fast motion first = most blur first). Returns a cancel function that also clears it.
 */
export function blurDecay(el: HTMLElement, axis: Axis, peak: BlurLevel, durationMs: number, delayMs = 0) {
  const timers: number[] = []
  const levels = Array.from({ length: peak }, (_, i) => (peak - i) as BlurLevel)
  const marks = [0, 0.12, 0.26, 0.42, 0.6]
  levels.forEach((level, i) => {
    timers.push(window.setTimeout(() => (el.style.filter = url(axis, level)), delayMs + marks[i]! * durationMs))
  })
  timers.push(window.setTimeout(() => (el.style.filter = ''), delayMs + 0.78 * durationMs))
  return () => {
    timers.forEach(clearTimeout)
    el.style.filter = ''
  }
}

export interface EnterOptions {
  /** Travel distance in px (positive = rises from below). */
  distance?: number
  /** Peak blur level 1–5 (0,6 · 1,2 · 2 · 3 · 4 px along the travel axis). */
  blur?: BlurLevel
  duration?: number
  delay?: number
}

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

/** Initial hidden state applied before the element enters. */
export function hideForEnter(el: HTMLElement, distance = 14) {
  if (prefersReducedMotion())
    return
  el.style.opacity = '0'
  el.style.transform = `translate3d(0, ${distance}px, 0)`
}

/** Rise + fade on the compositor, with a vertical motion blur that decays with the speed. */
export async function enterWithMotionBlur(el: HTMLElement, opts: EnterOptions = {}) {
  const { distance = 14, blur = 3, duration = 0.62, delay = 0 } = opts
  if (prefersReducedMotion()) {
    el.style.opacity = ''
    el.style.transform = ''
    return
  }
  // Start after the mount frame has painted so a heavy first render does not eat the timeline.
  await nextFrame()
  await nextFrame()
  el.style.willChange = 'transform, opacity'
  const cancelBlur = blur ? blurDecay(el, 'y', blur, duration * 1000, delay * 1000) : () => {}
  await animate(
    el,
    { opacity: [0, 1], transform: [`translate3d(0, ${distance}px, 0)`, 'translate3d(0, 0px, 0)'] },
    { duration, delay, ease: AAPM_EASE.emphasis },
  )
  cancelBlur()
  el.style.opacity = ''
  el.style.transform = ''
  el.style.willChange = ''
}

/**
 * Blocked action: a damped horizontal shake (≈480ms, three swings) with horizontal motion
 * blur on the fast swings. Composes with Tailwind's `translate` centering on dialogs.
 */
export async function shake(el: HTMLElement | null | undefined, amplitude = 7) {
  // The buzz plays even with reduced motion: the blocked state still needs a non-visual cue.
  sound.play('blocked')
  if (!el || prefersReducedMotion())
    return
  const a = amplitude
  el.style.willChange = 'transform'
  const cancelBlur = blurDecay(el, 'x', 2, 480)
  await animate(
    el,
    { transform: [0, -a, a * 0.82, -a * 0.58, a * 0.36, -a * 0.16, 0].map(x => `translateX(${x}px)`) },
    { duration: 0.48, ease: 'easeInOut' },
  )
  cancelBlur()
  el.style.transform = ''
  el.style.willChange = ''
}

/** Move focus to the first control marked invalid inside `root` (UX-07). */
export function focusFirstInvalid(root: HTMLElement | null | undefined) {
  const target = root?.querySelector<HTMLElement>('[aria-invalid="true"], [data-error="true"] ~ input, [data-error="true"] ~ * input, [data-error="true"] ~ button')
  target?.focus({ preventScroll: false })
}
