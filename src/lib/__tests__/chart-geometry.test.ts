import { describe, expect, it } from 'vitest'

import { areaPath, bucket, donutArcs, linearScale, linePath, niceTicks, smoothAreaPath, smoothLinePath, sparkDomain } from '../chart-geometry'

describe('sparkDomain', () => {
  // 30 days of production (kg) whose first day sits at the tail of a dip: the worst case for a cliff.
  const eggsKg = [6679, 6849, 6775, 6841, 6782, 6841, 6782, 6819, 6833, 6781, 6803, 6811, 6781, 6810, 6795, 6773, 6832, 6802, 6824, 6765, 6824, 6802, 6831, 6779, 6779, 6764, 6779, 6786, 6816, 6793]

  it('keeps headroom, so no point touches the top or bottom edge', () => {
    const [lo, hi] = sparkDomain(eggsKg)
    expect(lo).toBeLessThan(Math.min(...eggsKg))
    expect(hi).toBeGreaterThan(Math.max(...eggsKg))
  })

  it('gives small day-to-day noise a calm amplitude instead of the full height', () => {
    const flatish = [91.8, 92.1, 91.9, 92.0, 91.7, 92.2]
    const [lo, hi] = sparkDomain(flatish)
    const used = (Math.max(...flatish) - Math.min(...flatish)) / (hi - lo)
    expect(used).toBeLessThan(0.5)
  })

  it('still uses most of the height for a real trend', () => {
    const rising = [28, 31, 30, 34, 33, 36, 35, 38, 37, 40, 41, 39, 43, 45]
    const [lo, hi] = sparkDomain(rising)
    expect((45 - 28) / (hi - lo)).toBeGreaterThan(0.75)
  })

  it('is total for empty, single and flat input', () => {
    for (const v of [[], [5], [0, 0, 0], [7, 7]]) {
      const [lo, hi] = sparkDomain(v)
      expect(Number.isFinite(lo) && Number.isFinite(hi) && hi > lo).toBe(true)
    }
  })

  it('places points inside the plot when the paths use the domain', () => {
    const d = smoothLinePath(eggsKg, 200, 40, 4, sparkDomain(eggsKg))
    // Path numbers alternate x, y (M x,y C x,y,x,y,x,y …): keep every second one.
    const ys = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map(m => Number(m[0])).filter((_, i) => i % 2 === 1)
    expect(Math.min(...ys)).toBeGreaterThan(4)
    expect(Math.max(...ys)).toBeLessThan(36)
  })
})

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

describe('smooth paths (monotone cubic)', () => {
  const values = [1, 3, 2, 5, 4]
  it('passes through every data point that linePath uses', () => {
    const straight = linePath(values, 100, 40, 2)
    const smooth = smoothLinePath(values, 100, 40, 2)
    const pts = [...straight.matchAll(/[ML]([\d.]+),([\d.]+)/g)].map(m => `${m[1]},${m[2]}`)
    for (const p of pts)
      expect(smooth).toContain(p)
    expect(smooth.match(/C/g)).toHaveLength(values.length - 1)
  })

  it('never overshoots: control points stay inside the y-range of their segment', () => {
    const smooth = smoothLinePath([0, 10, 10, 0, 5], 100, 40, 2)
    const ys = [...smooth.matchAll(/C[\d.]+,([\d.-]+),[\d.]+,([\d.-]+),[\d.]+,([\d.-]+)/g)].flatMap(m => [Number(m[1]), Number(m[2])])
    for (const y of ys) {
      expect(y).toBeGreaterThanOrEqual(2)
      expect(y).toBeLessThanOrEqual(38)
    }
  })

  it('closes the area to the baseline and falls back for short series', () => {
    expect(smoothAreaPath(values, 100, 40, 2)).toMatch(/L98,40L2,40Z$/)
    expect(smoothLinePath([1, 2], 100, 40, 2)).toBe(linePath([1, 2], 100, 40, 2))
  })
})
