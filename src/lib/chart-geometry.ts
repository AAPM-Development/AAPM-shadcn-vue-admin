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

/**
 * Y-domain for sparklines and other small trend marks: min–max plus headroom, and never
 * narrower than a small share of the level. Day-to-day noise or a single dip then reads
 * at its real size instead of being stretched into a cliff across the full height.
 */
export function sparkDomain(values: number[], { headroom = 0.12, minSpan = 0.02 } = {}): Range {
  if (!values.length)
    return [0, 1]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const level = Math.max(Math.abs(min), Math.abs(max))
  const span = Math.max(max - min, level * minSpan) || 1
  const mid = (min + max) / 2
  const half = (span / 2) * (1 + headroom * 2)
  return [mid - half, mid + half]
}

function toPoints(values: number[], width: number, height: number, pad: number, domain?: Range) {
  const [min, max] = domain ?? [Math.min(...values), Math.max(...values)]
  const y = linearScale([min, max], [height - pad, pad])
  const x = values.length === 1
    ? () => width / 2
    : linearScale([0, values.length - 1], [pad, width - pad])
  return values.map((v, i) => [round(x(i)), round(y(v))] as const)
}

export function linePath(values: number[], width: number, height: number, pad = 2, domain?: Range): string {
  if (!values.length)
    return ''
  const points = toPoints(values, width, height, pad, domain)
  if (points.length === 1) {
    const [x, y] = points[0]
    return `M${x},${y}L${x},${y}`
  }
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join('')
}

/**
 * Monotone cubic tangents (Fritsch–Carlson): smooth, but never overshoots a data point — peaks and
 * troughs stay where the data puts them (dataviz direction §4).
 */
function monotoneTangents(points: readonly (readonly [number, number])[]): number[] {
  const n = points.length
  const d: number[] = []
  for (let k = 0; k < n - 1; k++) {
    const dx = points[k + 1]![0] - points[k]![0]
    d.push(dx === 0 ? 0 : (points[k + 1]![1] - points[k]![1]) / dx)
  }
  const m = points.map((_, k) => (k === 0 ? d[0]! : k === n - 1 ? d[n - 2]! : (d[k - 1]! * d[k]! > 0 ? (d[k - 1]! + d[k]!) / 2 : 0)))
  for (let k = 0; k < n - 1; k++) {
    if (d[k] === 0) {
      m[k] = 0
      m[k + 1] = 0
      continue
    }
    const a = m[k]! / d[k]!
    const b = m[k + 1]! / d[k]!
    const s = a * a + b * b
    if (s > 9) {
      const t = 3 / Math.sqrt(s)
      m[k] = t * a * d[k]!
      m[k + 1] = t * b * d[k]!
    }
  }
  return m
}

function smoothSegments(points: readonly (readonly [number, number])[]): string {
  const m = monotoneTangents(points)
  let out = `M${points[0]![0]},${points[0]![1]}`
  for (let k = 0; k < points.length - 1; k++) {
    const [x0, y0] = points[k]!
    const [x1, y1] = points[k + 1]!
    const h = (x1 - x0) / 3
    out += `C${round(x0 + h)},${round(y0 + m[k]! * h)},${round(x1 - h)},${round(y1 - m[k + 1]! * h)},${x1},${y1}`
  }
  return out
}

/** Smooth (monotone cubic) version of {@link linePath}; same point placement. */
export function smoothLinePath(values: number[], width: number, height: number, pad = 2, domain?: Range): string {
  if (values.length < 3)
    return linePath(values, width, height, pad, domain)
  return smoothSegments(toPoints(values, width, height, pad, domain))
}

/** Smooth (monotone cubic) version of {@link areaPath}, closed down to the baseline. */
export function smoothAreaPath(values: number[], width: number, height: number, pad = 2, domain?: Range): string {
  if (values.length < 3)
    return areaPath(values, width, height, pad, domain)
  const points = toPoints(values, width, height, pad, domain)
  const first = points[0]!
  const last = points[points.length - 1]!
  return `${smoothSegments(points)}L${last[0]},${height}L${first[0]},${height}Z`
}

export function areaPath(values: number[], width: number, height: number, pad = 2, domain?: Range): string {
  if (!values.length)
    return ''
  const points = toPoints(values, width, height, pad, domain)
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
