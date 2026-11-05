/**
 * Pure SVG geometry for the AAPM chart kit (components/aapm/charts).
 * Every function is total: empty, single-point and flat inputs never produce NaN.
 */

type Range = [number, number]

export function linearScale(domain: Range, range: Range): (v: number) => number {
  const [d0, d1] = domain
  const [r0, r1] = range
  if (d1 === d0)
    return () => (r0 + r1) / 2
  return v => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0)
}

const round = (v: number) => +v.toFixed(2)

function toPoints(values: number[], width: number, height: number, pad: number) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const y = linearScale([min, max], [height - pad, pad])
  const x = values.length === 1
    ? () => width / 2
    : linearScale([0, values.length - 1], [pad, width - pad])
  return values.map((v, i) => [round(x(i)), round(y(v))] as const)
}

export function linePath(values: number[], width: number, height: number, pad = 2): string {
  if (!values.length)
    return ''
  const points = toPoints(values, width, height, pad)
  if (points.length === 1) {
    const [x, y] = points[0]
    return `M${x},${y}L${x},${y}`
  }
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join('')
}

export function areaPath(values: number[], width: number, height: number, pad = 2): string {
  if (!values.length)
    return ''
  const points = toPoints(values, width, height, pad)
  const first = points[0]
  const last = points[points.length - 1]
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join('')
  return `${line}L${last[0]},${height}L${first[0]},${height}Z`
}

export interface DonutArc {
  d: string
  /** Index of the value in the input array, so color follows the entity. */
  index: number
  start: number
  end: number
  value: number
  share: number
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return [round(cx + r * Math.cos(rad)), round(cy + r * Math.sin(rad))] as const
}

function ringPath(c: number, outer: number, inner: number) {
  return [
    `M${c + outer},${c}A${outer},${outer} 0 1 1 ${c - outer},${c}A${outer},${outer} 0 1 1 ${c + outer},${c}Z`,
    `M${c + inner},${c}A${inner},${inner} 0 1 0 ${c - inner},${c}A${inner},${inner} 0 1 0 ${c + inner},${c}Z`,
  ].join('')
}

function sectorPath(c: number, outer: number, inner: number, a0: number, a1: number) {
  const large = a1 - a0 > 180 ? 1 : 0
  const [x0, y0] = polar(c, c, outer, a0)
  const [x1, y1] = polar(c, c, outer, a1)
  const [x2, y2] = polar(c, c, inner, a1)
  const [x3, y3] = polar(c, c, inner, a0)
  return `M${x0},${y0}A${outer},${outer} 0 ${large} 1 ${x1},${y1}L${x2},${y2}A${inner},${inner} 0 ${large} 0 ${x3},${y3}Z`
}

/** Annular sectors centred at (radius, radius), starting at 12 o'clock, clockwise. */
export function donutArcs(
  values: number[],
  opts: { radius: number, thickness: number, gapDeg?: number },
): DonutArc[] {
  const { radius, thickness, gapDeg = 0 } = opts
  const entries = values
    .map((value, index) => ({ value: Math.max(0, value), index }))
    .filter(e => e.value > 0)
  const total = entries.reduce((sum, e) => sum + e.value, 0)
  if (total <= 0)
    return []

  const inner = Math.max(0, radius - thickness)
  if (entries.length === 1) {
    const [only] = entries
    return [{ d: ringPath(radius, radius, inner), index: only.index, start: 0, end: 360, value: only.value, share: 1 }]
  }

  let cursor = 0
  return entries.map(({ value, index }) => {
    const sweep = (value / total) * 360
    const gap = Math.min(gapDeg, sweep * 0.5)
    const start = cursor + gap / 2
    const end = cursor + sweep - gap / 2
    cursor += sweep
    return { d: sectorPath(radius, radius, inner, start, end), index, start, end, value, share: value / total }
  })
}

function niceStep(raw: number) {
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const normalized = raw / magnitude
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return nice * magnitude
}

/** Clean axis ticks covering [min, max]: `niceTicks(0, 97)` → `[0, 20, 40, 60, 80, 100]`. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  let lo = Math.min(min, max)
  let hi = Math.max(min, max)
  if (hi === lo)
    hi = lo + (Math.abs(lo) || 1)
  const step = niceStep((hi - lo) / count)
  lo = Math.floor(lo / step) * step
  hi = Math.ceil(hi / step) * step
  const ticks: number[] = []
  for (let t = lo; t <= hi + step / 2; t += step)
    ticks.push(+t.toFixed(10))
  return ticks
}

/** Index into a sequential ramp: how many thresholds the value reaches. */
export function bucket(value: number, thresholds: number[]): number {
  return thresholds.filter(t => value >= t).length
}
