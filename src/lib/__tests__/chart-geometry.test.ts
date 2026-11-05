import { describe, expect, it } from 'vitest'

import { areaPath, bucket, donutArcs, linearScale, linePath, niceTicks } from '../chart-geometry'

describe('linearScale', () => {
  it('maps the domain onto the range', () => {
    const scale = linearScale([0, 10], [0, 100])
    expect(scale(5)).toBe(50)
  })

  it('maps a zero-width domain to the range midpoint', () => {
    const scale = linearScale([4, 4], [0, 100])
    expect(scale(4)).toBe(50)
  })
})

describe('linePath', () => {
  it('returns an empty path for no values', () => {
    expect(linePath([], 100, 20)).toBe('')
  })

  it('draws a single point without NaN', () => {
    const d = linePath([5], 100, 20)
    expect(d).not.toContain('NaN')
    expect(d.startsWith('M')).toBe(true)
  })

  it('draws a flat all-zero series without NaN', () => {
    expect(linePath([0, 0, 0], 100, 20)).not.toContain('NaN')
  })

  it('places the last point at the right edge minus padding', () => {
    const d = linePath([1, 2], 100, 20, 2)
    expect(d.endsWith('98,2')).toBe(true)
  })
})

describe('areaPath', () => {
  it('returns an empty path for no values', () => {
    expect(areaPath([], 100, 20)).toBe('')
  })

  it('closes down to the baseline', () => {
    const d = areaPath([1, 3, 2], 100, 20)
    expect(d.trim().endsWith('Z')).toBe(true)
    expect(d).not.toContain('NaN')
  })
})

describe('donutArcs', () => {
  it('returns nothing when every value is zero', () => {
    expect(donutArcs([0, 0], { radius: 50, thickness: 10 })).toEqual([])
  })

  it('splits shares that sum to one', () => {
    const arcs = donutArcs([1, 1], { radius: 50, thickness: 10 })
    expect(arcs).toHaveLength(2)
    expect(arcs.reduce((sum, a) => sum + a.share, 0)).toBeCloseTo(1)
    arcs.forEach(a => expect(a.d).not.toContain('NaN'))
  })

  it('skips zero-value segments but keeps their neighbours', () => {
    const arcs = donutArcs([3, 0, 1], { radius: 50, thickness: 10 })
    expect(arcs.map(a => a.value)).toEqual([3, 1])
  })

  it('draws a full ring for a single non-zero value', () => {
    const arcs = donutArcs([7], { radius: 50, thickness: 10 })
    expect(arcs).toHaveLength(1)
    expect(arcs[0].share).toBe(1)
    expect(arcs[0].d).not.toContain('NaN')
  })
})

describe('niceTicks', () => {
  it('rounds to clean steps', () => {
    expect(niceTicks(0, 97)).toEqual([0, 20, 40, 60, 80, 100])
  })

  it('handles a flat range', () => {
    const ticks = niceTicks(5, 5)
    expect(ticks.length).toBeGreaterThan(0)
    ticks.forEach(t => expect(Number.isFinite(t)).toBe(true))
  })
})

describe('bucket', () => {
  it('puts values below the first threshold in bucket 0', () => {
    expect(bucket(0, [1, 3, 5])).toBe(0)
  })

  it('counts the thresholds the value reaches', () => {
    expect(bucket(4, [1, 3, 5])).toBe(2)
  })

  it('caps at the number of thresholds', () => {
    expect(bucket(9, [1, 3, 5])).toBe(3)
  })
})
