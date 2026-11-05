// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import setupSelectPill, { enhanceMenu } from '../select-pill.module'

const PILL = '[data-aapm-menu-pill]'
const ITEM_HEIGHT = 36

/** happy-dom has no layout: give each item a fixed box so the pill has something to measure. */
function stubBox(el: HTMLElement, top: number) {
  Object.defineProperty(el, 'offsetTop', { configurable: true, value: top })
  Object.defineProperty(el, 'offsetLeft', { configurable: true, value: 4 })
  Object.defineProperty(el, 'offsetHeight', { configurable: true, value: ITEM_HEIGHT })
  Object.defineProperty(el, 'offsetWidth', { configurable: true, value: 180 })
}

/** Mirrors reka-ui's DOM: select content > viewport > items; dropdown content > items. */
function renderMenu(kind: 'select' | 'dropdown-menu' = 'select') {
  const content = document.createElement('div')
  content.setAttribute('data-slot', `${kind}-content`)
  content.setAttribute('data-state', 'open')
  let host = content
  if (kind === 'select') {
    host = document.createElement('div')
    host.setAttribute('data-reka-select-viewport', '')
    content.append(host)
  }
  const items = ['Kebun Sei Rampah', 'Kebun Tanah Raja', 'Kebun Bandar Betsy'].map((label, i) => {
    const item = document.createElement('div')
    item.setAttribute('data-slot', `${kind}-item`)
    item.textContent = label
    stubBox(item, 4 + i * ITEM_HEIGHT)
    host.append(item)
    return item
  })
  return { content, host, items }
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('select pill (sidebar-style highlight in select / dropdown menus)', () => {
  beforeEach(() => setupSelectPill())
  afterEach(() => document.body.replaceChildren())

  it('adds one pill per open menu', async () => {
    const select = renderMenu('select')
    const dropdown = renderMenu('dropdown-menu')
    document.body.append(select.content, dropdown.content)
    await flush()

    expect(select.content.querySelectorAll(PILL)).toHaveLength(1)
    expect(dropdown.content.querySelectorAll(PILL)).toHaveLength(1)
    // select: inside the scrolling viewport so it scrolls with the items
    expect(select.host.firstElementChild?.matches(PILL)).toBe(true)
    expect(select.content.querySelector(PILL)?.getAttribute('aria-hidden')).toBe('true')

    // idempotent: re-enhancing never stacks a second pill
    enhanceMenu(select.content)
    enhanceMenu(dropdown.content)
    expect(document.querySelectorAll(PILL)).toHaveLength(2)
  })

  it('moves to the highlighted item', async () => {
    const { content, items } = renderMenu('select')
    document.body.append(content)
    await flush()
    const pill = content.querySelector<HTMLElement>(PILL)!

    items[1]!.setAttribute('data-highlighted', '')
    await flush()
    expect(pill.style.translate).toContain(`${items[1]!.offsetTop}px`)
    expect(pill.style.height).toBe(`${ITEM_HEIGHT}px`)
    expect(pill.style.opacity).toBe('1')

    items[1]!.removeAttribute('data-highlighted')
    items[2]!.setAttribute('data-highlighted', '')
    await flush()
    expect(pill.style.translate).toContain(`${items[2]!.offsetTop}px`)
  })

  it('hides when nothing is highlighted', async () => {
    const { content, items } = renderMenu('dropdown-menu')
    document.body.append(content)
    await flush()
    const pill = content.querySelector<HTMLElement>(PILL)!
    expect(pill.style.opacity).toBe('0')

    items[0]!.setAttribute('data-highlighted', '')
    await flush()
    expect(pill.style.opacity).toBe('1')

    items[0]!.removeAttribute('data-highlighted')
    await flush()
    expect(pill.style.opacity).toBe('0')
  })
})

/**
 * Task 9 — immersive menus. Mirrors the stock components/ui markup:
 * context-menu / menubar: content > items; combobox: list > viewport > items;
 * command: root > command-list > presentation div > items.
 */
function renderFamily(kind: 'context-menu' | 'menubar' | 'combobox' | 'command', count = 3) {
  const content = document.createElement('div')
  content.setAttribute('data-slot', kind === 'combobox' ? 'combobox-list' : kind === 'command' ? 'command' : `${kind}-content`)
  content.setAttribute('data-state', 'open')
  let host: HTMLElement = content
  if (kind === 'combobox') {
    host = document.createElement('div')
    host.setAttribute('data-slot', 'combobox-viewport')
    content.append(host)
  }
  let parent: HTMLElement = host
  if (kind === 'command') {
    host = document.createElement('div')
    host.setAttribute('data-slot', 'command-list')
    parent = document.createElement('div')
    parent.setAttribute('role', 'presentation')
    host.append(parent)
    content.append(host)
  }
  const items = Array.from({ length: count }, (_, i) => {
    const item = document.createElement('div')
    item.setAttribute('data-slot', `${kind}-item`)
    item.textContent = `Kandang ${i + 1}`
    stubBox(item, 4 + i * ITEM_HEIGHT)
    parent.append(item)
    return item
  })
  return { content, host, items }
}

describe('immersive menus (Task 9)', () => {
  beforeEach(() => setupSelectPill())
  afterEach(() => document.body.replaceChildren())

  it.each(['context-menu', 'menubar', 'combobox', 'command'] as const)('pill in %s', async (kind) => {
    const { content, host, items } = renderFamily(kind)
    document.body.append(content)
    await flush()

    expect(content.querySelectorAll(PILL)).toHaveLength(1)
    // lives in the scrolling list (combobox viewport / command list) so it scrolls with the items
    expect(host.firstElementChild?.matches(PILL)).toBe(true)

    items[2]!.setAttribute('data-highlighted', '')
    await flush()
    const pill = content.querySelector<HTMLElement>(PILL)!
    expect(pill.style.opacity).toBe('1')
    expect(pill.style.translate).toContain(`${items[2]!.offsetTop}px`)
  })

  it('cascade index: the first 8 items get --aapm-i 0–7 on open, the rest none', async () => {
    const { content, items } = renderFamily('context-menu', 11)
    document.body.append(content)
    await flush()

    expect(content.hasAttribute('data-aapm-cascade')).toBe(true)
    items.slice(0, 8).forEach((item, i) => expect(item.style.getPropertyValue('--aapm-i')).toBe(String(i)))
    items.slice(8).forEach(item => expect(item.style.getPropertyValue('--aapm-i')).toBe(''))
  })

  it('items mounted later by filtering get no cascade index', async () => {
    const { content, items } = renderFamily('command', 2)
    document.body.append(content)
    await flush()

    const late = document.createElement('div')
    late.setAttribute('data-slot', 'command-item')
    stubBox(late, 80)
    items[1]!.after(late)
    await flush()
    expect(late.style.getPropertyValue('--aapm-i')).toBe('')
  })

  it('hides the pill when the highlighted item is filtered out', async () => {
    const { content, items } = renderFamily('command')
    document.body.append(content)
    await flush()
    items[1]!.setAttribute('data-highlighted', '')
    await flush()
    const pill = content.querySelector<HTMLElement>(PILL)!
    expect(pill.style.opacity).toBe('1')

    items[1]!.remove() // CommandItem's v-if drops filtered items
    await flush()
    expect(pill.style.opacity).toBe('0')
  })

  it('keeps sub-menu items out of the parent menu', async () => {
    const { content, items } = renderFamily('context-menu')
    const sub = document.createElement('div')
    sub.setAttribute('data-slot', 'context-menu-sub-content')
    sub.setAttribute('data-state', 'open')
    const subItem = document.createElement('div')
    subItem.setAttribute('data-slot', 'context-menu-item')
    stubBox(subItem, 4)
    sub.append(subItem)
    content.append(sub)
    document.body.append(content)
    await flush()

    subItem.setAttribute('data-highlighted', '')
    await flush()
    expect(content.querySelector<HTMLElement>(`:scope > ${PILL}`)!.style.opacity).toBe('0')
    expect(sub.querySelector<HTMLElement>(PILL)!.style.opacity).toBe('1')
    expect(items).toHaveLength(3)
  })
})
