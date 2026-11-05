// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest'

const stop = vi.hoisted(() => vi.fn())
const start = vi.hoisted(() => vi.fn())
vi.mock('lenis', () => ({
  default: class {
    stop = stop
    start = start
  },
}))

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.removeAttribute('style')
})

it('keeps Lenis stopped when the inline body lock is rendered as overflow:clip for sticky anchors', async () => {
  let onMutation: () => void = () => {}
  vi.stubGlobal('MutationObserver', class {
    constructor(callback: () => void) { onMutation = callback }
    observe() {}
  })
  window.matchMedia = vi.fn().mockReturnValue({ matches: false })
  vi.stubGlobal('getComputedStyle', () => ({ overflow: 'clip' }))
  const { setupSmoothScroll } = await import('../setup')
  setupSmoothScroll()
  document.body.style.overflow = 'hidden'
  onMutation()
  expect(stop).toHaveBeenCalledOnce()
  expect(start).not.toHaveBeenCalled()
  document.body.style.overflow = ''
  onMutation()
  expect(start).toHaveBeenCalledOnce()
})
