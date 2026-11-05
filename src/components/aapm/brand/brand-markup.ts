/**
 * Prepares an official AAPM Cloud ERP SVG master for the "Menetas" choreography.
 *
 * Nothing is redrawn: the master's own paths are tagged, wrapped in empty groups the
 * timeline can move, and given one sweep mask (ring) and two baseline clips (AAPM, Cloud
 * ERP). At rest every wrapper is an identity transform and the mask/clips cover the whole
 * artwork, so the static render — reduced motion, paused, no JS — is the master itself.
 */
import type { LockupVariant } from './logo-geometry'

import { hatchTimeline } from './hatch-timeline'
import { LOGO_GEOMETRY } from './logo-geometry'

const SVG_NS = 'http://www.w3.org/2000/svg'
const n = (v: number) => String(Math.round(v * 1000) / 1000)

function el(doc: Document, name: string, attrs: Record<string, string>) {
  const node = doc.createElementNS(SVG_NS, name)
  for (const [k, v] of Object.entries(attrs))
    node.setAttribute(k, v)
  return node
}

/** Wrap `target` in a new group (in place) and return the wrapper. */
function wrap(doc: Document, target: Element, attrs: Record<string, string>) {
  const group = el(doc, 'g', attrs)
  target.parentNode!.replaceChild(group, target)
  group.append(target)
  return group
}

const origin = (x: number, y: number) => `transform-box: view-box; transform-origin: ${n(x)}px ${n(y)}px`

export function buildLockupMarkup(master: string, variant: LockupVariant, prefix: string): string {
  const geo = LOGO_GEOMETRY[variant]
  const { origins } = hatchTimeline(variant)
  const source = master.replace(/<\?xml[^>]*\?>/, '')
    .replaceAll('cls-', `${prefix}-cls-`)
    .replace(/id="([^"]+)"/g, `id="${prefix}-$1"`)
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" ')
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml')
  const svg = doc.documentElement
  const layer = svg.querySelector('g')!

  // Master structure — horizontal: g > [icon, g > [AAPM, Cloud ERP]];
  // stacked: [AAPM, g > [loud ERP, icon (the "C")]].
  const horizontal = variant === 'erp'
  const lockup = horizontal ? layer.children[0]! : layer
  const icon = horizontal ? lockup.children[0]! : lockup.children[1]!.children[1]!
  const main = horizontal ? lockup.children[1]!.children[0]! : lockup.children[0]!
  const sub = horizontal ? lockup.children[1]!.children[1]! : lockup.children[1]!.children[0]!
  const [head, ring] = [icon.children[0]!, icon.children[1]!]

  icon.setAttribute('data-logo-part', 'icon')
  main.setAttribute('data-logo-part', 'main')
  sub.setAttribute('data-logo-part', 'sub')
  main.setAttribute('clip-path', `url(#${prefix}-clip-main)`)
  sub.setAttribute('clip-path', `url(#${prefix}-clip-sub)`)
  Array.from(main.children).forEach((letter, i) => {
    letter.setAttribute('data-logo-letter', String(i))
    letter.setAttribute('style', 'transform-box: view-box')
  })
  Array.from(sub.children).forEach((glyph, i) => {
    glyph.setAttribute('data-logo-glyph', String(i))
    glyph.setAttribute('style', 'transform-box: view-box')
  })

  ring.setAttribute('data-logo-ring', '')
  ring.setAttribute('mask', `url(#${prefix}-sweep)`)
  head.setAttribute('data-logo-head', '')
  head.setAttribute('style', origin(origins.neck.x, origins.neck.y))
  wrap(doc, head, { 'data-logo-nod': '', 'style': origin(origins.neck.x, origins.neck.y) })

  const breath = wrap(doc, icon, { 'data-logo-breath': '', 'style': origin(origins.emblem.x, origins.emblem.y) })
  const travelY = wrap(doc, breath, { 'data-logo-travel-y': '', 'style': origin(origins.emblem.x, origins.emblem.y) })
  wrap(doc, travelY, { 'data-logo-travel-x': '', 'style': 'transform-box: view-box' })

  // Sweep: a circle whose stroke is as wide as its diameter paints a disc; dashing it with
  // pathLength 1 paints a growing sector, clockwise from 12 o'clock.
  const reach = Math.hypot(geo.emblem.w, geo.emblem.h) / 2 + 0.5
  const { x: cx, y: cy } = origins.emblem
  const defs: Element = svg.querySelector('defs') ?? svg.insertBefore(el(doc, 'defs', {}), svg.firstChild)
  const mask = el(doc, 'mask', {
    id: `${prefix}-sweep`,
    maskUnits: 'userSpaceOnUse',
    x: n(cx - reach),
    y: n(cy - reach),
    width: n(reach * 2),
    height: n(reach * 2),
  })
  mask.append(el(doc, 'circle', {
    'data-logo-sweep': '',
    'cx': n(cx),
    'cy': n(cy),
    'r': n(reach / 2),
    'fill': 'none',
    'stroke': '#fff',
    'stroke-width': n(reach),
    'pathLength': '1',
    'stroke-dasharray': '1 1',
    'stroke-dashoffset': '0',
    'transform': `rotate(-90 ${n(cx)} ${n(cy)})`,
  }))

  // Baseline clips: letters rise from below the AAPM baseline; glyphs slide out from behind subEdge.
  const clipMain = el(doc, 'clipPath', { id: `${prefix}-clip-main`, clipPathUnits: 'userSpaceOnUse' })
  clipMain.append(el(doc, 'rect', {
    x: n(Math.min(geo.view.x, geo.main.x) - 2),
    y: n(geo.main.y - 3),
    width: n(geo.view.w + 4),
    height: n(geo.main.h + 3.25),
  }))
  const clipSub = el(doc, 'clipPath', { id: `${prefix}-clip-sub`, clipPathUnits: 'userSpaceOnUse' })
  clipSub.append(el(doc, 'rect', {
    x: n(geo.subEdge),
    y: n(geo.sub.y - 1.5),
    width: n(geo.sub.x + geo.sub.w + 2 - geo.subEdge),
    height: n(geo.sub.h + 3),
  }))
  defs.append(mask, clipMain, clipSub)

  return new XMLSerializer().serializeToString(svg)
}
