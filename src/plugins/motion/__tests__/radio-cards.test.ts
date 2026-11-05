// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import setupRadioCards from '../radio-cards.module'

interface Box { left: number, top: number, width: number, height: number }

/** happy-dom has no layout: give each card a fixed box. */
function stubBox(el: HTMLElement, box: Box) {
  Object.defineProperties(el, {
    offsetLeft: { configurable: true, get: () => box.left },
    offsetTop: { configurable: true, get: () => box.top },
    offsetWidth: { configurable: true, get: () => box.width },
    offsetHeight: { configurable: true, get: () => box.height },
  })
}

/** A radio-card group shaped like kit-identity: label cards, each holding a reka radio button. */
function renderGroup(checked: number | null, count = 3) {
  const root = document.createElement('div')
  root.setAttribute('role', 'radiogroup')
  root.setAttribute('data-aapm-radio-cards', '')
  for (let i = 0; i < count; i++) {
    const card = document.createElement('label')
    const radio = document.createElement('button')
    radio.setAttribute('role', 'radio')
    radio.setAttribute('data-state', i === checked ? 'checked' : 'unchecked')
    card.append(radio, document.createTextNode(`Perusahaan ${i + 1}`))
    stubBox(card, { left: 4, top: i * 60, width: 320, height: 52 })
    root.append(card)
  }
  document.body.append(root)
  return root
}

function highlightsOf(root: HTMLElement) {
  return [...root.children].filter(el => el.hasAttribute('data-aapm-card-highlight')) as HTMLElement[]
}

/** MutationObserver callbacks are microtasks; one macrotask lets them all run. */
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('radio cards sliding highlight', () => {
  beforeAll(() => {
    setupRadioCards()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('radio cards: one highlight per group', async () => {
    const a = renderGroup(0)
    const b = renderGroup(1)
    await flush()

    setupRadioCards() // a second install must not add another highlight
    await flush()

    for (const root of [a, b]) {
      const highlights = highlightsOf(root)
      expect(highlights).toHaveLength(1)
      expect(highlights[0]!.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('moves to the checked card', async () => {
    const root = renderGroup(0)
    await flush()
    const [highlight] = highlightsOf(root)
    expect(highlight!.style.translate).toBe('4px 0px')
    expect(highlight!.style.opacity).toBe('1')

    const radios = root.querySelectorAll('[role="radio"]')
    radios[0]!.setAttribute('data-state', 'unchecked')
    radios[2]!.setAttribute('data-state', 'checked')
    await flush()

    expect(highlight!.style.translate).toBe('4px 120px')
    expect(highlight!.style.width).toBe('320px')
    expect(highlight!.style.height).toBe('52px')
    expect(highlight!.style.opacity).toBe('1')

    radios[2]!.setAttribute('data-state', 'unchecked')
    await flush()
    expect(highlight!.style.opacity).toBe('0')
  })
})
