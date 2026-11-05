// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import setupPickers, { monthOf, rollNumber, sweepRange } from '../calendar.module'

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

/** Mirrors components/ui/calendar: root > grid > cells (reka cell triggers with data-value). */
function renderCalendar(kind: 'calendar' | 'range-calendar', month: string) {
  const root = document.createElement('div')
  root.setAttribute('data-slot', kind)
  const grid = document.createElement('table')
  grid.setAttribute('data-slot', `${kind}-grid`)
  root.append(grid)
  fillMonth(grid, kind, month)
  return { root, grid }
}

function fillMonth(grid: HTMLElement, kind: string, month: string) {
  grid.replaceChildren()
  for (let d = 1; d <= 5; d++) {
    const td = document.createElement('td')
    td.setAttribute('data-slot', `${kind}-cell`)
    const cell = document.createElement('div')
    cell.setAttribute('data-reka-calendar-cell-trigger', '')
    cell.setAttribute('data-slot', kind === 'calendar' ? 'calendar-cell-trigger' : 'range-calendar-trigger')
    cell.setAttribute('data-value', `${month}-0${d}`)
    td.append(cell)
    grid.append(td)
  }
}

describe('pickers', () => {
  beforeAll(() => setupPickers())
  afterEach(() => document.body.replaceChildren())

  it('reads the month from the first in-month cell', () => {
    const { root } = renderCalendar('calendar', '2026-11')
    expect(monthOf(root)).toBe('2026-11')
  })

  it('month change sets direction: next, then prev', async () => {
    const { root, grid } = renderCalendar('calendar', '2026-11')
    document.body.append(root)
    await flush()

    fillMonth(grid, 'calendar', '2026-12')
    await flush()
    expect(root.getAttribute('data-aapm-dir')).toBe('next')

    fillMonth(grid, 'calendar', '2026-11')
    await flush()
    expect(root.getAttribute('data-aapm-dir')).toBe('prev')

    // across a year boundary still compares chronologically
    fillMonth(grid, 'calendar', '2025-12')
    await flush()
    expect(root.getAttribute('data-aapm-dir')).toBe('prev')
  })

  it('pops a day only when an existing cell becomes selected', async () => {
    const { root, grid } = renderCalendar('calendar', '2026-11')
    document.body.append(root)
    await flush()
    const cell = grid.querySelector('[data-value="2026-11-03"]')!
    cell.setAttribute('data-selected', '')
    await flush()
    expect(cell.hasAttribute('data-aapm-pop')).toBe(true)

    // a month render that arrives already selected does not pop
    fillMonth(grid, 'calendar', '2026-12')
    const fresh = grid.querySelector('[data-value="2026-12-02"]')!
    fresh.setAttribute('data-selected', '')
    await flush()
    expect(fresh.hasAttribute('data-aapm-pop')).toBe(false)
  })

  it('range fill marks ends and indexes the cells in order', async () => {
    const { root, grid } = renderCalendar('range-calendar', '2026-11')
    document.body.append(root)
    await flush()
    const cells = Array.from(grid.querySelectorAll<HTMLElement>('[data-reka-calendar-cell-trigger]'))
    cells.slice(1, 4).forEach(c => c.setAttribute('data-selected', ''))
    cells[1]!.setAttribute('data-selection-start', '')
    cells[3]!.setAttribute('data-selection-end', '')
    sweepRange(root)

    const tds = Array.from(grid.querySelectorAll<HTMLElement>('[data-slot="range-calendar-cell"]'))
    expect(tds[1]!.getAttribute('data-aapm-range-end')).toBe('start')
    expect(tds[3]!.getAttribute('data-aapm-range-end')).toBe('end')
    expect(tds[2]!.hasAttribute('data-aapm-range-end')).toBe(false)
    expect(tds[1]!.style.getPropertyValue('--aapm-ri')).toBe('0')
    expect(tds[3]!.style.getPropertyValue('--aapm-ri')).toBe('2')
    expect(root.hasAttribute('data-aapm-sweep')).toBe(true)
  })

  it('number roll overlays old and new values without moving the input', () => {
    const group = document.createElement('div')
    const input = document.createElement('input')
    input.setAttribute('role', 'spinbutton')
    input.value = '13'
    group.append(input)
    document.body.append(group)

    rollNumber(input, '12', 'up')
    const lane = group.querySelector('[data-aapm-roll]')
    expect(lane?.getAttribute('aria-hidden')).toBe('true')
    expect(lane?.textContent).toBe('1213')
    expect(input.hasAttribute('data-aapm-rolling')).toBe(true)
  })
})
