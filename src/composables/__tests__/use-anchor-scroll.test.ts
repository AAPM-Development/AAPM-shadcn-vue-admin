// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { scrollToAnchorWhenStable } from '../use-anchor-scroll'

/** An element whose viewport top follows a script (one value per check), then holds the last. */
function scriptedElement(id: string, tops: number[]) {
  const el = document.createElement('section')
  el.id = id
  let i = 0
  el.getBoundingClientRect = () => ({ top: tops[Math.min(i++, tops.length - 1)] } as DOMRect)
  document.body.append(el)
  return el
}

describe('scrollToAnchorWhenStable', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('waits until the anchor stops moving, then scrolls it below the sticky offset', async () => {
    scriptedElement('status-semantik', [4000, 2500, 900, 900, 900])
    const scroller = { resize: vi.fn(), scrollTo: vi.fn() }
    const done = scrollToAnchorWhenStable('status-semantik', { scroller, offset: 128, intervalMs: 10 })
    await vi.advanceTimersByTimeAsync(200)
    expect(await done).toBe(900 - 128)
    expect(scroller.scrollTo).toHaveBeenCalledTimes(1)
    expect(scroller.scrollTo).toHaveBeenCalledWith(772, { immediate: false, force: true })
    expect(scroller.resize).toHaveBeenCalled()
  })

  it('scrolls immediately under reduced motion', async () => {
    scriptedElement('mfa', [300])
    const scroller = { scrollTo: vi.fn() }
    const done = scrollToAnchorWhenStable('mfa', { scroller, offset: 100, intervalMs: 10, reducedMotion: true })
    await vi.advanceTimersByTimeAsync(100)
    await done
    expect(scroller.scrollTo).toHaveBeenCalledWith(200, { immediate: true, force: true })
  })

  it('falls back to the window without a smooth-scroll engine', async () => {
    scriptedElement('dokumen', [640])
    const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const done = scrollToAnchorWhenStable('dokumen', { scroller: null, offset: 40, intervalMs: 10 })
    await vi.advanceTimersByTimeAsync(100)
    expect(await done).toBe(600)
    expect(spy).toHaveBeenCalledWith({ top: 600, behavior: 'smooth' })
  })

  it('gives up quietly when the anchor never appears', async () => {
    const scroller = { scrollTo: vi.fn() }
    const done = scrollToAnchorWhenStable('nowhere', { scroller, timeoutMs: 300, intervalMs: 10 })
    await vi.advanceTimersByTimeAsync(400)
    expect(await done).toBeNull()
    expect(scroller.scrollTo).not.toHaveBeenCalled()
  })

  it('never scrolls above the top of the page', async () => {
    scriptedElement('aksi', [20])
    const scroller = { scrollTo: vi.fn() }
    const done = scrollToAnchorWhenStable('aksi', { scroller, offset: 128, intervalMs: 10 })
    await vi.advanceTimersByTimeAsync(100)
    expect(await done).toBe(0)
  })
})
