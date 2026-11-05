import { describe, expect, it } from 'vitest'

import type { Pose } from '../hatch-timeline'

import { HATCH_CYCLE_MS, HATCH_REST_WINDOW, hatchTimeline, samplePose } from '../hatch-timeline'
import { LOGO_GEOMETRY } from '../logo-geometry'

const VARIANTS = ['erp', 'erp-stacked'] as const
const IDENTITY: Required<Pose> = { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, dash: 0 }

/** Resolve a sampled pose against identity so missing channels compare as "at rest". */
const full = (pose: Pose): Required<Pose> => ({ ...IDENTITY, ...pose })
/** A sweep mask with dash offset 1 or -1 hides the ring completely; both read as "hidden". */
function visual(pose: Pose) {
  const p = full(pose)
  return { ...p, dash: Math.abs(p.dash) >= 1 ? 1 : p.dash }
}

describe.each(VARIANTS)('hatch timeline (%s)', (variant) => {
  const timeline = hatchTimeline(variant)

  it('rests on the official artwork: every part is back at identity during the hold', () => {
    const [from, to] = HATCH_REST_WINDOW
    for (const at of [from, (from + to) / 2, to]) {
      for (const track of timeline.tracks.filter(t => t.restsAtIdentity))
        expect(full(samplePose(track, at)), `${track.id} @ ${at}ms`).toEqual(IDENTITY)
    }
  })

  it('loops without a seam: the cycle ends exactly where it starts', () => {
    for (const track of timeline.tracks)
      expect(visual(samplePose(track, timeline.cycle)), track.id).toEqual(visual(samplePose(track, 0)))
  })

  it('starts with nothing visible but the empty stage', () => {
    const visibleAtStart = timeline.tracks
      .filter(t => ['sweep', 'head', 'letter', 'glyph', 'light'].includes(t.kind))
      .filter((t) => {
        const p = full(samplePose(t, 0))
        return t.kind === 'sweep' ? Math.abs(p.dash) < 1 : p.opacity > 0
      })
    expect(visibleAtStart.map(t => t.id)).toEqual([])
  })

  it('reveals in order: sweep → head → travel → AAPM → Cloud ERP → sheen', () => {
    const first = (kind: string) => Math.min(...timeline.tracks.filter(t => t.kind === kind).map(t => t.frames[1]!.at))
    const order = ['sweep', 'head', 'travel-x', 'letter', 'glyph', 'light'].map(first)
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  it('holds the finished lockup for at least 12s in a cycle of at least 20s', () => {
    const [from, to] = HATCH_REST_WINDOW
    expect(to - from).toBeGreaterThanOrEqual(12_000)
    expect(timeline.cycle).toBe(HATCH_CYCLE_MS)
    expect(HATCH_CYCLE_MS).toBeGreaterThanOrEqual(20_000)
  })

  it('animates one track per letter and per glyph of the master artwork', () => {
    const geo = LOGO_GEOMETRY[variant]
    expect(timeline.tracks.filter(t => t.kind === 'letter')).toHaveLength(geo.letters)
    expect(timeline.tracks.filter(t => t.kind === 'glyph')).toHaveLength(geo.glyphs)
  })

  it('keeps frame times inside the cycle and in ascending order', () => {
    for (const track of timeline.tracks) {
      const times = track.frames.map(f => f.at)
      expect(times[0], track.id).toBe(0)
      expect(times.at(-1), track.id).toBe(timeline.cycle)
      expect(times, track.id).toEqual([...times].sort((a, b) => a - b))
    }
  })
})
