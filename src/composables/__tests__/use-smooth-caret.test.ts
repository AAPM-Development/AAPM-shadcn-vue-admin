// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sound } from '@/lib/sound'

import { attachSmoothCaret, measureCaret } from '../use-smooth-caret'

vi.mock('@/lib/sound', () => ({ sound: { play: vi.fn(() => true) } }))

/* Keep motion's frame loop out of the tests: glides, pulses and flicks resolve at once. */
vi.mock('motion-v', async importOriginal => ({
  ...await importOriginal<typeof import('motion-v')>(),
  animate: vi.fn(() => ({ stop: vi.fn(), cancel: vi.fn(), then: (done: () => void) => Promise.resolve().then(done) })),
}))

const PADDING = 12
const FIELD_WIDTH = 200

let frames: FrameRequestCallback[] = []
let detachers: Array<() => void> = []

function flushFrames() {
  const pending = frames
  frames = []
  pending.forEach(cb => cb(0))
}

function mountInput(init: Partial<Pick<HTMLInputElement, 'type' | 'value' | 'placeholder'>> = {}) {
  const field = document.createElement('div')
  const input = document.createElement('input')
  input.setAttribute('data-slot', 'input')
  Object.assign(input, init)
  input.style.paddingLeft = `${PADDING}px`
  input.style.paddingRight = `${PADDING}px`
  Object.defineProperty(input, 'clientWidth', { configurable: true, value: FIELD_WIDTH })
  field.append(input)
  document.body.append(field)
  return input
}

function attach(input: HTMLInputElement) {
  const detach = attachSmoothCaret(input)
  detachers.push(detach)
  input.focus()
  flushFrames()
  return detach
}

/** A mirror span whose measured text width is fixed by the test. */
function stubMirror(initialWidth: number) {
  let width = initialWidth
  const mirror = document.createElement('span')
  document.body.append(mirror)
  mirror.getBoundingClientRect = () => ({ x: 0, y: 0, top: 0, left: 0, width, height: 18, right: width, bottom: 18, toJSON: () => ({}) }) as DOMRect
  Object.defineProperty(mirror, 'offsetWidth', { configurable: true, get: () => width })
  return { mirror, setWidth: (next: number) => (width = next) }
}

const caretOf = (input: HTMLInputElement) => input.parentElement!.querySelector<HTMLElement>('[data-aapm-caret]')
const ghostOf = (input: HTMLInputElement) => input.parentElement!.querySelector<HTMLElement>('[data-aapm-caret-ghost]')

beforeEach(() => {
  frames = []
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames[id - 1] = () => {}
  })
  vi.mocked(sound.play).mockClear()
})

afterEach(() => {
  detachers.forEach(detach => detach())
  detachers = []
  vi.useRealTimers()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('measureCaret', () => {
  it('measureCaret returns padding-left for an empty value', () => {
    const input = mountInput()
    const { mirror } = stubMirror(0)

    const caret = measureCaret(input, 0, mirror)

    expect(caret.x).toBe(PADDING)
    expect(caret.visible).toBe(true)
    expect(caret.height).toBeGreaterThan(0)
  })

  it('measureCaret subtracts scrollLeft and clamps', () => {
    const input = mountInput({ value: 'x'.repeat(80) })
    Object.defineProperty(input, 'scrollLeft', { configurable: true, value: 40 })
    const { mirror, setWidth } = stubMirror(300)

    const beyond = measureCaret(input, 80, mirror)
    expect(beyond.x).toBeLessThanOrEqual(FIELD_WIDTH - PADDING)
    expect(beyond.x).toBe(FIELD_WIDTH - PADDING)
    expect(beyond.visible).toBe(false)

    setWidth(150)
    const inside = measureCaret(input, 40, mirror)
    expect(inside.x).toBe(150 + PADDING - 40)
    expect(inside.visible).toBe(true)
  })

  it('measures password as bullets', () => {
    const input = mountInput({ type: 'password', value: 'rahasia' })
    const { mirror } = stubMirror(24)

    measureCaret(input, 3, mirror)

    expect(mirror.textContent).toBe('•'.repeat(3))
    expect(mirror.textContent).not.toContain('rah')
  })
})

describe('attachSmoothCaret', () => {
  it('hides during composition', () => {
    const input = mountInput()
    attach(input)
    const caret = caretOf(input)!
    expect(caret.getAttribute('aria-hidden')).toBe('true')
    expect(caret.hasAttribute('data-hidden')).toBe(false)
    expect(input.hasAttribute('data-aapm-caret-host')).toBe(true)

    input.dispatchEvent(new Event('compositionstart'))
    expect(caret.getAttribute('data-hidden')).toBe('true')
    // The native caret comes back for the IME while composing.
    expect(input.hasAttribute('data-aapm-caret-host')).toBe(false)

    input.dispatchEvent(new Event('compositionend'))
    flushFrames()
    expect(caret.hasAttribute('data-hidden')).toBe(false)
    expect(input.hasAttribute('data-aapm-caret-host')).toBe(true)
  })

  it('hides while a range is selected', () => {
    const input = mountInput({ value: 'halo dunia' })
    attach(input)
    const caret = caretOf(input)!
    expect(caret.hasAttribute('data-hidden')).toBe(false)

    input.setSelectionRange(1, 3)
    input.dispatchEvent(new Event('select'))
    flushFrames()

    expect(caret.getAttribute('data-hidden')).toBe('true')
  })

  it('plays tick when emptied by delete', () => {
    const input = mountInput()
    attach(input)

    input.value = 'a'
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: 'a' }))
    expect(sound.play).not.toHaveBeenCalled()

    input.value = ''
    input.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward' }))

    expect(sound.play).toHaveBeenCalledTimes(1)
    expect(sound.play).toHaveBeenCalledWith('tick')
  })

  it('ghosts the placeholder on first character', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const input = mountInput({ placeholder: 'Cari pengguna' })
    attach(input)
    expect(ghostOf(input)).toBeNull()

    input.value = 'a'
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: 'a' }))

    const ghost = ghostOf(input)
    expect(ghost?.textContent).toBe('Cari pengguna')
    expect(ghost?.getAttribute('aria-hidden')).toBe('true')

    vi.advanceTimersByTime(200)
    expect(ghostOf(input)).toBeNull()
  })
})
