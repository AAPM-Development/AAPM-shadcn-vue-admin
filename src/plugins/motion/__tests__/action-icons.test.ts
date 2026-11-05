// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import setupActionIcons, { actionOf, ICON_ACTIONS, PLAY_MS, playHost } from '../action-icons.module'

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

function lucide(name: string): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('class', `lucide lucide-${name}`)
  return svg
}

function button(icon: string, attrs: Record<string, string> = {}) {
  const btn = document.createElement('button')
  Object.entries(attrs).forEach(([k, v]) => btn.setAttribute(k, v))
  const svg = lucide(icon)
  btn.append(svg, 'Aksi')
  return { btn, svg }
}

describe('action icons everywhere', () => {
  beforeAll(() => setupActionIcons())
  afterEach(() => {
    document.body.replaceChildren()
    vi.useRealTimers()
  })

  it('maps lucide glyphs to actions', () => {
    expect(actionOf(lucide('trash-2'))).toBe('delete')
    expect(actionOf(lucide('pencil'))).toBe('edit')
    expect(actionOf(lucide('chevrons-up-down'))).toBe('sort')
    expect(Object.values(ICON_ACTIONS)).toContain('settings')
  })

  it('tags icons inside buttons, not loose or state icons', async () => {
    const { btn, svg } = button('trash-2')
    const loose = lucide('plus')
    const checkbox = button('check', { role: 'checkbox' })
    document.body.append(btn, loose, checkbox.btn)
    await flush()

    expect(svg.getAttribute('data-action')).toBe('delete')
    expect(svg.hasAttribute('data-aapm-auto')).toBe(true)
    expect(loose.hasAttribute('data-action')).toBe(false)
    expect(checkbox.svg.hasAttribute('data-action')).toBe(false)
  })

  it('leaves AnimatedIcon-managed svgs alone', async () => {
    const { btn, svg } = button('copy')
    svg.setAttribute('data-action', 'copy')
    document.body.append(btn)
    await flush()
    expect(svg.hasAttribute('data-aapm-auto')).toBe(false)
  })

  it('plays on hover once, then rests', async () => {
    const { btn, svg } = button('pencil')
    document.body.append(btn)
    await flush()
    vi.useFakeTimers()

    btn.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }))
    expect(svg.getAttribute('data-playing')).toBe('true')
    vi.advanceTimersByTime(PLAY_MS + 10)
    expect(svg.getAttribute('data-playing')).toBe('false')
  })

  it('maps sidebar glyphs to archetypes and farm glyphs by data-source', async () => {
    expect(actionOf(lucide('layout-dashboard'))).toBe('tiles')
    expect(actionOf(lucide('users'))).toBe('people')
    expect(actionOf(lucide('sparkles'))).toBe('sparkle')

    const farm = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    farm.setAttribute('class', 'aapm-livestock')
    farm.setAttribute('data-source', 'iconoven:chicken')
    expect(actionOf(farm)).toBe('peck')

    const a = document.createElement('a')
    a.href = '/dashboard'
    const nav = lucide('layout-dashboard')
    a.append(nav, farm)
    document.body.append(a)
    await flush()
    expect(nav.getAttribute('data-action')).toBe('tiles')
    expect(farm.getAttribute('data-action')).toBe('peck')
  })

  it('does not play on a disabled host', async () => {
    const { btn, svg } = button('trash-2', { disabled: '' })
    document.body.append(btn)
    await flush()
    playHost(btn)
    expect(svg.getAttribute('data-playing')).toBeNull()
  })

  it('uses distinct directions and draw motions for the corrected system actions', () => {
    expect(actionOf(lucide('maximize-2'))).toBe('maximize')
    expect(actionOf(lucide('minimize-2'))).toBe('minimize')
    expect(actionOf(lucide('scan-line'))).toBe('scan')
    expect(actionOf(lucide('route'))).toBe('route')
    expect(actionOf(lucide('zoom-in'))).toBe('zoomIn')
  })

  it('covers user and table toolbar variants on mouse press and keyboard focus', async () => {
    for (const glyph of ['mail-plus', 'user-plus', 'loader', 'settings-2', 'refresh-ccw', 'arrow-up', 'chevrons-right']) {
      const { btn, svg } = button(glyph)
      document.body.append(btn)
      await flush()
      expect(svg.hasAttribute('data-aapm-auto'), glyph).toBe(true)
      btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0 }))
      expect(svg.getAttribute('data-playing'), glyph).toBe('true')
    }
    const { btn, svg } = button('settings-2')
    document.body.append(btn)
    await flush()
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(svg.getAttribute('data-playing')).toBe('true')
  })

  it('retags a reused SVG when sorting changes its glyph', async () => {
    const { btn, svg } = button('chevrons-up-down')
    document.body.append(btn)
    await flush()
    expect(svg.getAttribute('data-action')).toBe('sort')
    svg.setAttribute('class', 'lucide lucide-arrow-down')
    await flush()
    expect(svg.getAttribute('data-action')).toBe('down')
  })
})
