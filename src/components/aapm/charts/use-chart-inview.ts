import type { MaybeRefOrGetter } from 'vue'

import { onBeforeUnmount, onMounted, shallowRef, toValue } from 'vue'

import { prefersReducedMotion } from '@/components/aapm/motion/easing'

/**
 * Chart entrance trigger (motion v2, Task 11). Marks the chart root `data-aapm-chart` and, once at
 * least `amount` of it has been on screen, `data-aapm-inview` — once, never again. CSS in
 * assets/motion/charts.css and the charts' own Motion props key their entrance off it.
 *
 * Data is never held hostage: under reduced motion, without IntersectionObserver, or when the chart
 * mounts already on screen during a route change, `inView` is true from the first frame where it
 * can be, and charts render their final state.
 */
export function useChartInView(
  target: MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>,
  { amount = 0.3 }: { amount?: number } = {},
) {
  const immediate = typeof window === 'undefined'
    || typeof IntersectionObserver === 'undefined'
    || prefersReducedMotion()
  const inView = shallowRef(immediate)
  let observer: IntersectionObserver | undefined

  function mark(el: Element) {
    el.setAttribute('data-aapm-chart', '')
    if (inView.value)
      el.setAttribute('data-aapm-inview', '')
  }

  onMounted(() => {
    const el = toValue(target)
    if (!el)
      return
    mark(el)
    if (inView.value)
      return
    observer = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        inView.value = true
        el.setAttribute('data-aapm-inview', '')
        observer?.disconnect()
        observer = undefined
      }
    }, { threshold: amount })
    observer.observe(el)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return inView
}

/** Bar / cell stagger: `step` seconds per item, never more than `cap` seconds in total. */
export function stagger(index: number, step = 0.04, cap = 0.32): number {
  return Math.min(index * step, cap)
}
