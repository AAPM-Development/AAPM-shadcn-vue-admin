/**
 * AAPM UI soundpack — tiny, synthesized with Web Audio (no audio files, no licensing).
 * Subtle but noticeable: short envelopes, low master gain, throttled, and user-mutable
 * (persisted under `aapm-ui-sound`). Sound always accompanies a visual cue, never replaces it.
 */

export type SoundName = 'blocked' | 'error' | 'success' | 'notify' | 'tick' | 'pop'

interface Note {
  freq: number
  /** Glide target (Hz) over the note's duration. */
  to?: number
  start: number
  dur: number
  gain: number
  type: OscillatorType
}

/*
 * ERP soundpack (revised 2026-11-05, user: "too game-like"): sine only, no pitch glides, no melodic
 * intervals, short and quiet — closer to an OS / productivity-app click than a game chime. A global
 * low-pass (see createSoundEngine) takes the edge off every tone.
 */
export const SOUNDPACK: Record<SoundName, Note[]> = {
  /* Blocked action: two soft, low knocks that land with the shake's first two swings */
  blocked: [
    { freq: 165, start: 0, dur: 0.06, gain: 0.18, type: 'sine' },
    { freq: 147, start: 0.1, dur: 0.07, gain: 0.15, type: 'sine' },
  ],
  /* Error toast: one muted low tone — noticeable, never alarming */
  error: [{ freq: 294, start: 0, dur: 0.16, gain: 0.08, type: 'sine' }],
  /* Success: a single glassy "tock" (tone + quiet octave overtone, struck together) */
  success: [
    { freq: 880, start: 0, dur: 0.12, gain: 0.05, type: 'sine' },
    { freq: 1760, start: 0, dur: 0.08, gain: 0.015, type: 'sine' },
  ],
  /* Info / warning toast: one soft mid tone */
  notify: [{ freq: 660, start: 0, dur: 0.11, gain: 0.04, type: 'sine' }],
  /* Switch / checkbox / radio / tab: a barely-there click */
  tick: [{ freq: 1500, start: 0, dur: 0.012, gain: 0.022, type: 'sine' }],
  /* Dialog / confirmation opens: a soft low tap, no upward glide */
  pop: [{ freq: 440, start: 0, dur: 0.045, gain: 0.025, type: 'sine' }],
}

const MASTER_GAIN = 0.5
/** Low-pass corner: removes the bright "beep" edge so tones read as soft clicks. */
const LOWPASS_HZ = 2400
const SAME_SOUND_GAP_MS = 90
/** An error or notice right after a blocked buzz is the same event — do not stack sounds. */
const AFTER_BLOCKED_GAP_MS = 500

export interface SoundEngineOptions {
  context: () => AudioContext | null
  enabled: () => boolean
  now: () => number
}

export function createSoundEngine(opts: SoundEngineOptions) {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  const lastAt = new Map<SoundName, number>()

  function ensure() {
    if (ctx)
      return ctx
    try {
      ctx = opts.context()
    }
    catch {
      ctx = null
    }
    if (ctx) {
      master = ctx.createGain()
      master.gain.setValueAtTime(MASTER_GAIN, ctx.currentTime)
      if (typeof ctx.createBiquadFilter === 'function') {
        const soften = ctx.createBiquadFilter()
        soften.type = 'lowpass'
        soften.frequency.setValueAtTime(LOWPASS_HZ, ctx.currentTime)
        soften.Q.setValueAtTime(0.5, ctx.currentTime)
        master.connect(soften)
        soften.connect(ctx.destination)
      }
      else {
        master.connect(ctx.destination)
      }
    }
    return ctx
  }

  function play(name: SoundName): boolean {
    if (!opts.enabled())
      return false
    const t = opts.now()
    const last = lastAt.get(name)
    if (last !== undefined && t - last < SAME_SOUND_GAP_MS)
      return false
    const blockedAt = lastAt.get('blocked')
    if ((name === 'error' || name === 'notify') && blockedAt !== undefined && t - blockedAt < AFTER_BLOCKED_GAP_MS)
      return false

    const audio = ensure()
    if (!audio || !master)
      return false
    if (audio.state === 'suspended')
      void audio.resume()

    lastAt.set(name, t)
    const base = audio.currentTime + 0.005
    for (const note of SOUNDPACK[name]) {
      const start = base + note.start
      const end = start + note.dur
      const osc = audio.createOscillator()
      const env = audio.createGain()
      osc.type = note.type
      osc.frequency.setValueAtTime(note.freq, start)
      if (note.to)
        osc.frequency.exponentialRampToValueAtTime(note.to, end)
      env.gain.setValueAtTime(0.0001, start)
      env.gain.linearRampToValueAtTime(note.gain, start + 0.012) // soft attack: no click transient
      env.gain.exponentialRampToValueAtTime(0.0001, end)
      osc.connect(env)
      env.connect(master)
      osc.start(start)
      osc.stop(end + 0.02)
    }
    return true
  }

  /** Browsers only allow audio after a user gesture; call from the first pointer/key event. */
  function unlock() {
    const audio = ensure()
    if (audio?.state === 'suspended')
      void audio.resume()
  }

  return { play, unlock }
}

const STORAGE_KEY = 'aapm-ui-sound'
let enabledOverride: boolean | null = null

export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  }
  catch {
    return true
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  }
  catch {
    /* storage unavailable: preference lasts for this page only */
  }
  enabledOverride = on
}

/** App-wide engine (lazy AudioContext). */
export const sound = createSoundEngine({
  context: () => {
    const Ctor = typeof window !== 'undefined'
      ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
      : undefined
    return Ctor ? new Ctor() : null
  },
  enabled: () => enabledOverride ?? isSoundEnabled(),
  now: () => (typeof performance !== 'undefined' ? performance.now() : Date.now()),
})
