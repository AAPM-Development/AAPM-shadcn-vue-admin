/**
 * Geometry of the official AAPM Cloud ERP masters in /public/brand (viewBox units), measured
 * with getBBox() on the shipped SVG files. The animation only moves, masks and clips the
 * official artwork; it never redraws or outlines it, so these boxes are its whole contract.
 * Re-measure if a master file changes.
 */
export type LockupVariant = 'erp' | 'erp-stacked'

export interface Box { x: number, y: number, w: number, h: number }

export interface LogoGeometry {
  view: Box
  /** Emblem = ring + rooster head. */
  emblem: Box
  head: Box
  /** "AAPM" wordmark row and its letter count. */
  main: Box
  letters: number
  /** "Cloud ERP" (horizontal) or "loud ERP" next to the emblem-as-C (stacked). */
  sub: Box
  glyphs: number
  /** Glyphs slide out from behind this x (the emblem's right edge, or the text column). */
  subEdge: number
}

export const LOGO_GEOMETRY: Record<LockupVariant, LogoGeometry> = {
  'erp': {
    view: { x: 0, y: 0, w: 114.13, h: 40.2 },
    emblem: { x: 0, y: 0, w: 36.53, h: 40.18 },
    head: { x: 9.02, y: 5.76, w: 27.51, h: 23.76 },
    main: { x: 43.97, y: 5.73, w: 70.18, h: 16.1 },
    letters: 4,
    sub: { x: 43.98, y: 25.84, w: 47.49, h: 8.61 },
    glyphs: 8,
    subEdge: 43.5,
  },
  'erp-stacked': {
    view: { x: 0, y: 0, w: 70.14, h: 28.76 },
    emblem: { x: 10.25, y: 19.97, w: 8.02, h: 8.79 },
    head: { x: 12.24, y: 21.24, w: 6.02, h: 5.2 },
    main: { x: -0.02, y: -0.02, w: 70.18, h: 16.09 },
    letters: 4,
    sub: { x: 18.44, y: 20.08, w: 41.44, h: 8.61 },
    glyphs: 7,
    subEdge: 18.3,
  },
}

export const centerOf = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 })
