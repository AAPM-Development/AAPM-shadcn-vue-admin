// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'

import { followersOf, glide, GLIDE_MS } from '../layout-stability.module'

/** happy-dom has no layout: stack boxes vertically by hand. */
function box(el: HTMLElement, top: number, height: number) {
  el.getBoundingClientRect = () => ({ top, bottom: top + height, left: 0, right: 100, width: 100, height, x: 0, y: top, toJSON: () => ({}) }) as DOMRect
}

describe('layout stability', () => {
  afterEach(() => document.body.replaceChildren())

  it('followers are later siblings below the block, up the ancestor chain to <main>', () => {
    const main = document.createElement('main')
    const card = document.createElement('div')
    const table = document.createElement('table')
    const footer = document.createElement('div')
    const preview = document.createElement('section')
    const side = document.createElement('aside')
    card.append(table, footer)
    main.append(card, preview)
    document.body.append(main, side)
    box(table, 0, 200)
    box(footer, 200, 40)
    box(card, 0, 240)
    box(preview, 260, 100)
    box(side, 0, 100)

    expect(followersOf(table)).toEqual([footer, preview])
  })

  it('a side-by-side column does not move', () => {
    const main = document.createElement('main')
    const left = document.createElement('div')
    const right = document.createElement('div')
    main.append(left, right)
    document.body.append(main)
    box(left, 0, 300)
    box(right, 0, 300) // same row: starts above the left column's bottom
    expect(followersOf(left)).toEqual([])
  })

  it('glide is an additive translate from the old position', () => {
    const el = document.createElement('div')
    const animate = vi.fn()
    el.animate = animate as unknown as HTMLElement['animate']
    glide(el, 48)
    expect(animate).toHaveBeenCalledWith(
      [{ translate: '0 -48px' }, { translate: '0 0' }],
      expect.objectContaining({ duration: GLIDE_MS, composite: 'add' }),
    )
  })
})
