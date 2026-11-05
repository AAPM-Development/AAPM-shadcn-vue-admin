/**
 * Weighted, inertial page scrolling (Lenis). Registered from plugins/index.ts.
 *
 * - Off for `prefers-reduced-motion: reduce` and for touch (native momentum is already right).
 * - Nested scrollers (tables, dialog bodies, select lists, chat) scroll natively.
 * - Pauses while a modal locks body scroll, so the page behind a dialog never moves.
 * - In-page anchors (KPI "Rincian" drilldowns) glide instead of jumping.
 */
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

let lenis: Lenis | null = null

export function getLenis() {
  return lenis
}

export function setupSmoothScroll() {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return

  lenis = new Lenis({
    autoRaf: true,
    // lerp (not a fixed duration): follows the wheel immediately and only smooths the tail,
    // so scrolling never lags behind input. 0.16 ≈ settles in ~200ms.
    lerp: 0.16,
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    allowNestedScroll: true,
    anchors: { offset: -72 },
    prevent: node => node.closest?.('[data-lenis-prevent], [role="dialog"], [role="alertdialog"], [role="listbox"], [role="menu"]') != null,
  })

  // Reka locks scroll by styling <body>; mirror that lock on Lenis.
  const syncLock = () => {
    const locked = document.body.style.overflow === 'hidden'
      || getComputedStyle(document.body).overflow === 'hidden'
      || document.body.hasAttribute('data-scroll-locked')
    if (locked)
      lenis?.stop()
    else
      lenis?.start()
  }
  new MutationObserver(syncLock).observe(document.body, { attributes: true, attributeFilter: ['style', 'data-scroll-locked'] })
}
