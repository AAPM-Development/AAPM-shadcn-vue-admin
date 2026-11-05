import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSoundEngine, SOUNDPACK } from '../sound'

/** Minimal Web Audio fake that records every oscillator the engine schedules. */
function fakeContext() {
  const oscillators: { type: string, freq: number[] }[] = []
  const param = (log?: number[]) => ({
    setValueAtTime: vi.fn((v: number) => log?.push(v)),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn((v: number) => log?.push(v)),
  })
  const ctx = {
    currentTime: 0,
    state: 'running',
    destination: {},
    resume: vi.fn(async () => {}),
    createGain: () => ({ gain: param(), connect: vi.fn(() => ({ connect: vi.fn() })) }),
    createOscillator: () => {
      const osc = { type: 'sine', freq: [] as number[] }
      oscillators.push(osc)
      return {
        get type() { return osc.type },
        set type(t: string) { osc.type = t },
        frequency: param(osc.freq),
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }
    },
  }
  return { ctx: ctx as unknown as AudioContext, oscillators }
}

describe('sound engine', () => {
  let now = 1000
  beforeEach(() => {
    now = 1000
  })

  it('ships the full soundpack', () => {
    expect(Object.keys(SOUNDPACK).sort()).toEqual(['blocked', 'error', 'notify', 'pop', 'success', 'tick'])
  })

  it('sounds like an application, not a game: sine only, no pitch glides, quiet', () => {
    for (const [name, notes] of Object.entries(SOUNDPACK)) {
      for (const note of notes) {
        expect(note.type, name).toBe('sine')
        expect(note.to, name).toBeUndefined()
        expect(note.gain, name).toBeLessThanOrEqual(0.2)
      }
    }
  })

  it('plays the blocked buzz as two low pulses', () => {
    const { ctx, oscillators } = fakeContext()
    const engine = createSoundEngine({ context: () => ctx, enabled: () => true, now: () => now })
    expect(engine.play('blocked')).toBe(true)
    expect(oscillators).toHaveLength(2)
    oscillators.forEach(o => expect(o.freq[0]).toBeLessThan(250))
  })

  it('stays silent when the user turned sound off', () => {
    const { ctx, oscillators } = fakeContext()
    const engine = createSoundEngine({ context: () => ctx, enabled: () => false, now: () => now })
    expect(engine.play('success')).toBe(false)
    expect(oscillators).toHaveLength(0)
  })

  it('throttles the same sound fired twice within 90ms', () => {
    const { ctx } = fakeContext()
    const engine = createSoundEngine({ context: () => ctx, enabled: () => true, now: () => now })
    expect(engine.play('tick')).toBe(true)
    now += 40
    expect(engine.play('tick')).toBe(false)
    now += 100
    expect(engine.play('tick')).toBe(true)
  })

  it('does not stack an error chime right after a blocked buzz', () => {
    const { ctx } = fakeContext()
    const engine = createSoundEngine({ context: () => ctx, enabled: () => true, now: () => now })
    engine.play('blocked')
    now += 250
    expect(engine.play('error')).toBe(false)
    now += 600
    expect(engine.play('error')).toBe(true)
  })

  it('never throws when Web Audio is unavailable', () => {
    const engine = createSoundEngine({ context: () => null, enabled: () => true, now: () => now })
    expect(engine.play('blocked')).toBe(false)
  })
})
