/** Motion curves mirrored from tokens/primitives.css (--aapm-ease-*). */
export const AAPM_EASE = {
  out: [0.22, 1, 0.36, 1],
  emphasis: [0.16, 1, 0.3, 1],
} as const satisfies Record<string, [number, number, number, number]>

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
