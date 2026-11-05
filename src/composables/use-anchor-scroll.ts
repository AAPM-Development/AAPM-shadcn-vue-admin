/**
 * Scroll to an in-page anchor once it holds still.
 *
 * Used when the anchor's container only mounts on demand: for example, a /ui-kit tab that Reka
 * mounts on activation while the previous tab is still leaving. Measuring too early targets a
 * position that moves a moment later. Timer-based on purpose: requestAnimationFrame never fires
 * in a background tab.
 */
export interface AnchorScroller {
  resize?: () => void
  scrollTo: (target: number, options: { immediate: boolean, force: boolean }) => void
}

export interface AnchorScrollOptions {
  /** A smooth-scroll engine (Lenis) that owns the window scroll; falls back to `window.scrollTo`. */
  scroller?: AnchorScroller | null
  /** Pixels kept free above the anchor (sticky header + sticky toolbars). */
  offset?: number
  reducedMotion?: boolean
  intervalMs?: number
  timeoutMs?: number
}

/** Resolves with the scroll target used, or null when the anchor never appeared in time. */
export function scrollToAnchorWhenStable(id: string, options: AnchorScrollOptions = {}): Promise<number | null> {
  const { scroller = null, offset = 0, reducedMotion = false, intervalMs = 32, timeoutMs = 1000 } = options
  const deadline = Date.now() + timeoutMs
  let last = Number.NaN
  let stable = 0

  return new Promise((resolve) => {
    const check = () => {
      const el = document.getElementById(id)
      const top = el ? el.getBoundingClientRect().top + window.scrollY : Number.NaN
      stable = Math.abs(top - last) < 1 ? stable + 1 : 0
      last = top
      const timedOut = Date.now() > deadline
      if (el && (stable >= 2 || timedOut)) {
        const target = Math.max(0, top - offset)
        if (scroller) {
          scroller.resize?.()
          scroller.scrollTo(target, { immediate: reducedMotion, force: true })
        }
        else {
          window.scrollTo({ top: target, behavior: reducedMotion ? 'auto' : 'smooth' })
        }
        resolve(target)
        return
      }
      if (timedOut)
        resolve(null)
      else
        setTimeout(check, intervalMs)
    }
    setTimeout(check, intervalMs)
  })
}
