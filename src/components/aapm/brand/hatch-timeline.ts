/**
 * "Menetas" (hatch): the AAPM Cloud ERP logo choreography as plain data.
 *
 *   0.15–1.25s  the ring fills clockwise behind a sweep mask (solid artwork, no outlines)
 *   0.95–1.70s  the rooster head pops out and settles with a small nod
 *   1.50–2.50s  the emblem leaves the centre of the stage on an arc and lands in the lockup
 *   1.90–2.90s  A-A-P-M rise one by one from behind their baseline
 *   2.35–3.30s  "Cloud ERP" slides out from behind the emblem / text edge
 *   3.30–4.55s  one light pass; the lockup then rests on the official artwork
 *   7–11s       the emblem breathes (≈1.4%) · 11.3s second light pass · 15s the rooster nods
 *   20.0–22.6s  everything closes in reverse; 1.4s of empty stage; the cycle repeats (24s)
 *
 * The component turns every track into one Web Animation (iterations: Infinity) on the
 * element it names, so all parts share one clock and never drift.
 */
import type { LockupVariant } from './logo-geometry'

import { centerOf, LOGO_GEOMETRY } from './logo-geometry'

export interface Pose { x?: number, y?: number, scale?: number, rotate?: number, opacity?: number, dash?: number }
/** `ease` applies to the segment that starts at this frame (Web Animations keyframe easing). */
export interface Frame { at: number, pose: Pose, ease?: string }
export type TrackKind = 'travel-x' | 'travel-y' | 'breath' | 'sweep' | 'head' | 'nod' | 'letter' | 'glyph' | 'light'
export interface Track {
  id: string
  kind: TrackKind
  index?: number
  /** Translation unit: SVG user units (px) or a percentage of the HTML sheen layer. */
  unit: 'px' | '%'
  /** Identity tracks must be exactly at rest (identity) throughout HATCH_REST_WINDOW. */
  restsAtIdentity: boolean
  frames: Frame[]
}
export interface HatchTimeline {
  cycle: number
  tracks: Track[]
  /** transform-origin (view-box units) for the emblem groups and the head pivot. */
  origins: { emblem: { x: number, y: number }, neck: { x: number, y: number } }
  stage: { dx: number, dy: number, scale: number }
}

export const HATCH_CYCLE_MS = 24_000
/** Every identity track rests on the official artwork between these times. */
export const HATCH_REST_WINDOW: [number, number] = [3_600, 19_900]

export const HATCH_EASE = {
  sweep: 'cubic-bezier(0.65, 0, 0.35, 1)',
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  travel: 'cubic-bezier(0.76, 0, 0.24, 1)',
  arc: 'cubic-bezier(0.33, 1, 0.68, 1)',
  settle: 'cubic-bezier(0.45, 0, 0.55, 1)',
  exit: 'cubic-bezier(0.7, 0, 0.84, 0)',
  sine: 'cubic-bezier(0.37, 0, 0.63, 1)',
} as const

type Step = [at: number, pose: Pose, ease?: string]

function track(id: string, kind: TrackKind, steps: Step[], opts: Partial<Pick<Track, 'index' | 'unit' | 'restsAtIdentity'>> = {}): Track {
  const frames = steps.map(([at, pose, ease]) => ({ at, pose, ease }))
  if (frames[0]!.at !== 0)
    frames.unshift({ at: 0, pose: frames[0]!.pose, ease: undefined })
  if (frames.at(-1)!.at !== HATCH_CYCLE_MS)
    frames.push({ at: HATCH_CYCLE_MS, pose: frames.at(-1)!.pose, ease: undefined })
  return { id, kind, unit: 'px', restsAtIdentity: true, ...opts, frames }
}

export function hatchTimeline(variant: LockupVariant): HatchTimeline {
  const geo = LOGO_GEOMETRY[variant]
  const emblem = centerOf(geo.emblem)
  const view = centerOf(geo.view)
  // The emblem opens alone, centred and as large as the stage allows (never smaller than 0.9).
  const scale = Math.min(2.6, Math.max(0.9, (geo.view.h * 0.9) / geo.emblem.h))
  const stage = { dx: view.x - emblem.x, dy: view.y - emblem.y, scale }
  const neck = { x: geo.head.x + geo.head.w * 0.35, y: geo.head.y + geo.head.h }

  const tracks: Track[] = [
    track('travel-x', 'travel-x', [
      [1_500, { x: stage.dx }, HATCH_EASE.travel],
      [2_500, { x: 0 }],
      [20_700, { x: 0 }, HATCH_EASE.travel],
      [21_600, { x: stage.dx }],
    ]),
    // Y and scale take a different curve from X, so the emblem lands on an arc, not a line.
    track('travel-y', 'travel-y', [
      [1_500, { y: stage.dy, scale }, HATCH_EASE.arc],
      [2_500, { y: 0, scale: 1 }],
      [20_700, { y: 0, scale: 1 }, HATCH_EASE.settle],
      [21_600, { y: stage.dy, scale }],
    ]),
    track('breath', 'breath', [
      [7_000, { scale: 1 }, HATCH_EASE.sine],
      [9_000, { scale: 1.014 }, HATCH_EASE.sine],
      [11_000, { scale: 1 }],
    ], { restsAtIdentity: false }),
    // Dash offset 1 → 0 grows the sweep clockwise from 12 o'clock; 0 → −1 wipes it away
    // in the same direction, so the ring "closes" the way it opened.
    track('sweep', 'sweep', [
      [150, { dash: 1 }, HATCH_EASE.sweep],
      [1_250, { dash: 0 }],
      [21_650, { dash: 0 }, HATCH_EASE.sweep],
      [22_550, { dash: -1 }],
    ]),
    track('head', 'head', [
      [950, { opacity: 0, scale: 0.5, rotate: -16 }, HATCH_EASE.out],
      [1_400, { opacity: 1, scale: 1.06, rotate: 5 }, HATCH_EASE.settle],
      [1_700, { opacity: 1, scale: 1, rotate: 0 }],
      [21_450, { opacity: 1, scale: 1, rotate: 0 }, HATCH_EASE.exit],
      [21_800, { opacity: 0, scale: 0.5, rotate: -16 }],
    ]),
    track('nod', 'nod', [
      [15_000, { rotate: 0 }, HATCH_EASE.sine],
      [15_450, { rotate: -7 }, HATCH_EASE.sine],
      [15_950, { rotate: 2 }, HATCH_EASE.sine],
      [16_300, { rotate: 0 }],
    ], { restsAtIdentity: false }),
  ]

  const drop = geo.main.h + 1.5
  for (let i = 0; i < geo.letters; i++) {
    const rise = 1_900 + i * 85
    const sink = 20_150 + (geo.letters - 1 - i) * 60
    tracks.push(track(`letter-${i}`, 'letter', [
      [rise, { y: drop, opacity: 0 }, HATCH_EASE.out],
      [rise + 750, { y: 0, opacity: 1 }],
      [sink, { y: 0, opacity: 1 }, HATCH_EASE.exit],
      [sink + 420, { y: drop, opacity: 0 }],
    ], { index: i }))
  }

  const shift = -geo.sub.h * 0.8
  for (let j = 0; j < geo.glyphs; j++) {
    const out = 2_350 + j * 40
    const back = 20_000 + (geo.glyphs - 1 - j) * 28
    tracks.push(track(`glyph-${j}`, 'glyph', [
      [out, { x: shift, opacity: 0 }, HATCH_EASE.out],
      [out + 650, { x: 0, opacity: 1 }],
      [back, { x: 0, opacity: 1 }, HATCH_EASE.exit],
      [back + 360, { x: shift, opacity: 0 }],
    ], { index: j }))
  }

  // Two light passes across the solid lockup; the jump back happens while invisible.
  const pass = (start: number): Step[] => [
    [start, { x: -120, opacity: 0 }, HATCH_EASE.sine],
    [start + 250, { x: -70, opacity: 0.75 }],
    [start + 1_000, { x: 70, opacity: 0.75 }, HATCH_EASE.sine],
    [start + 1_250, { x: 120, opacity: 0 }],
    [start + 1_251, { x: -120, opacity: 0 }],
  ]
  tracks.push(track('light', 'light', [...pass(3_300), ...pass(11_300)], { unit: '%', restsAtIdentity: false }))

  return { cycle: HATCH_CYCLE_MS, tracks, origins: { emblem, neck }, stage }
}

/** Pose of a track at time `at`: exact at frames, linear in between (for tests and tooling). */
export function samplePose(track: Track, at: number): Pose {
  const frames = track.frames
  let i = frames.length - 1
  while (i > 0 && frames[i]!.at > at)
    i--
  const a = frames[Math.max(0, i)]!
  const b = frames[i + 1]
  if (!b || a.at === at)
    return a.pose
  const t = (at - a.at) / (b.at - a.at)
  const keys = new Set([...Object.keys(a.pose), ...Object.keys(b.pose)]) as Set<keyof Pose>
  const pose: Pose = {}
  for (const key of keys) {
    const from = a.pose[key] ?? (key === 'scale' || key === 'opacity' ? 1 : 0)
    const to = b.pose[key] ?? (key === 'scale' || key === 'opacity' ? 1 : 0)
    pose[key] = from + (to - from) * t
  }
  return pose
}
