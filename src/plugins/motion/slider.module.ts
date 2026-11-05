/**
 * Slider drag state. reka-ui's slider exposes no dragging attribute, so this marks
 * `[data-slot='slider']` with `data-dragging` while a pointer drags it; assets/motion/controls.css
 * drops the position transition under that attribute (the thumb follows the pointer 1:1) and
 * springs it otherwise (track click, keyboard steps).
 *
 * The attribute is set once the pointer has moved a few px after the press, not on pointerdown:
 * reka moves the thumb inside its own pointerdown handler on a track click, and that jump springs.
 */
import type { MotionModule } from './types'

const SLIDER = '[data-slot="slider"]'
const DRAGGING = 'data-dragging'
/** Movement (px) that turns a press into a drag; below it a click jitter keeps the spring. */
const DRAG_THRESHOLD = 3

let installed = false
let press: { slider: HTMLElement, x: number, y: number } | null = null

function release() {
  press?.slider.removeAttribute(DRAGGING)
  press = null
}

export const setupSliderDrag: MotionModule = () => {
  if (installed || typeof document === 'undefined')
    return
  installed = true
  const opts = { capture: true, passive: true } as const

  document.addEventListener('pointerdown', (event) => {
    release()
    const slider = event.target instanceof Element ? event.target.closest<HTMLElement>(SLIDER) : null
    if (slider && !slider.hasAttribute('data-disabled'))
      press = { slider, x: event.clientX, y: event.clientY }
  }, opts)

  document.addEventListener('pointermove', (event) => {
    if (!press || press.slider.hasAttribute(DRAGGING))
      return
    if (Math.abs(event.clientX - press.x) + Math.abs(event.clientY - press.y) >= DRAG_THRESHOLD)
      press.slider.setAttribute(DRAGGING, '')
  }, opts)

  document.addEventListener('pointerup', release, opts)
  document.addEventListener('pointercancel', release, opts)
}

export default setupSliderDrag
