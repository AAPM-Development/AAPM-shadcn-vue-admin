/**
 * Action icons, everywhere (motion v2 — "animate every action button like a Lottie icon").
 *
 * Any Lucide <svg> sitting inside an interactive host (button, link, menu item, option, trigger)
 * whose glyph has a meaning in ICON_ACTIONS gets `data-action` + `data-aapm-auto`. When the
 * pointer enters the host (or presses it on touch / clicks it from the keyboard), the svg gets
 * `data-playing="true"` for one choreography in assets/motion/icons.css — parts move on their own
 * (lid lifts and slams, pencil scribbles, dots wave…), then it returns to rest.
 *
 * Pages and components/ui stay untouched. <AnimatedIcon> (explicit `play`, copy→check swap,
 * refresh loading loop, delete tear) keeps managing its own svg: anything that already carries
 * `data-action` without `data-aapm-auto` is left alone.
 */
import type { MotionModule } from './types'

/** Lucide class (`lucide-<name>`) → action key used by icons.css. */
export const ICON_ACTIONS: Record<string, string> = {
  'trash-2': 'delete',
  'trash': 'delete',
  'pencil': 'edit',
  'square-pen': 'edit',
  'plus': 'add',
  'eye': 'view',
  'search': 'search',
  'ellipsis': 'more',
  'ellipsis-vertical': 'more',
  'settings': 'settings',
  'log-out': 'logout',
  'archive': 'archive',
  'history': 'history',
  'paperclip': 'attach',
  'message-square': 'comment',
  'copy': 'copy',
  'download': 'download',
  'upload': 'upload',
  'printer': 'print',
  'send': 'submit',
  'refresh-cw': 'refresh',
  'funnel': 'filter',
  'arrow-up-down': 'sort',
  'check': 'approve',
  'x': 'reject',
  'lock-keyhole': 'locked',
  'bell': 'notification',
  'save': 'save',
  'file-down': 'export',
  'share-2': 'share',
  'thumbs-up': 'like',
  'undo-2': 'reverse',
  'rotate-ccw': 'reopen',
  'calendar': 'calendar',
  'log-in': 'right',
  // ── Common system glyphs (registry group `common`) ──
  'file-up': 'upload',
  'circle-plus': 'add',
  'file-pen-line': 'edit',
  'pencil-line': 'edit',
  // ── Swept 2026-11-05: every glyph the app imports now has a motion ──
  'arrow-down-az': 'down',
  'arrow-down-za': 'down',
  'arrow-up-right': 'nudge',
  'award': 'swing',
  'badge-dollar-sign': 'turn',
  'calendar-days': 'calendar',
  'calendar-range': 'calendar',
  'chart-no-axes-combined': 'bars',
  'circle': 'press',
  'circle-check': 'approve',
  'circle-dashed': 'turn',
  'circle-help': 'help',
  'circle-slash': 'reject',
  'circle-x': 'reject',
  'clipboard': 'hop',
  'clock-alert': 'wiggle',
  'copy-check': 'approve',
  'handshake': 'wiggle',
  'layers': 'drop',
  'layout-list': 'list',
  'lightbulb': 'sparkle',
  'menu': 'list',
  'milestone': 'right',
  'monitor': 'settle',
  'move-horizontal': 'swipe',
  'network': 'press',
  'pause': 'press',
  'percent': 'turn',
  'play': 'press',
  'radio-tower': 'press',
  'shield-alert': 'wiggle',
  'sun-moon': 'quarter',
  'thumbs-down': 'press',
  'timer-off': 'quarter',
  'triangle-alert': 'wiggle',
  'unfold-horizontal': 'swipe',
  'user-round-cog': 'people',
  'user-round-plus': 'userAdd',
  'wifi-off': 'reject',
  'copy-plus': 'copy',
  'scan-line': 'scan',
  'barcode': 'scanBarcode',
  'scan-qr-code': 'scanQr',
  'link': 'wiggle',
  'unlink': 'wiggle',
  'mail': 'tiltOpen',
  'phone': 'wiggle',
  'map': 'rock',
  'route': 'route',
  'clock': 'quarter',
  'timer': 'quarter',
  'alarm-clock': 'wiggle',
  'camera': 'shutter',
  'image': 'rock',
  'folder': 'tiltOpen',
  'folder-open': 'tiltOpen',
  'cloud-upload': 'up',
  'star': 'sparkle',
  'flag': 'swing',
  'tag': 'swing',
  'bookmark': 'drop',
  'pin': 'pin',
  'columns-3': 'tiles',
  'maximize-2': 'maximize',
  'minimize-2': 'minimize',
  'zoom-in': 'zoomIn',
  'keyboard': 'tiles',
  'globe': 'quarter',
  'fuel': 'drop',
  'weight': 'hop',
  'signature': 'draw',
  'stamp': 'save',
  'receipt': 'list',
  'credit-card': 'swipe',
  'sigma': 'tiles',
  'list-checks': 'list',
  'clipboard-list': 'list',
  'message-circle': 'comment',
  'inbox': 'drop',
  'bell-ring': 'notification',
  'user-plus': 'userAdd',
  'user-check': 'userVerify',
  'shield': 'settle',
  'key-round': 'turn',
  'lock-open': 'hop',
  'eye-off': 'hide',
  'ban': 'reject',
  'power': 'press',
  'grip-vertical': 'tiles',
  'move': 'nudge',
  'archive-restore': 'hop',
  'send-horizontal': 'submit',
  'heart': 'like',
  // ── Navigation & sidebar glyphs → motion archetypes (assets/motion/icons.css "Archetypes") ──
  'layout-dashboard': 'tiles',
  'layout-grid': 'tiles',
  'component': 'tiles',
  'boxes': 'tiles',
  'blend': 'tiles',
  'list-todo': 'list',
  'clipboard-check': 'list',
  'receipt-text': 'list',
  'file-text': 'list',
  'book-open': 'list',
  'database': 'list',
  'users': 'people',
  'user-round': 'people',
  'user': 'people',
  'user-cog': 'people',
  'contact-round': 'people',
  'sparkles': 'sparkle',
  'shield-check': 'shield',
  'badge-check': 'shield',
  'bug': 'wiggle',
  'palette': 'wiggle',
  'paintbrush': 'wiggle',
  'wallet': 'tiltOpen',
  'banknote': 'swipe',
  'hand-coins': 'drop',
  'message-square-text': 'comment',
  'package': 'hop',
  'package-check': 'hop',
  'shopping-cart': 'drive',
  'truck': 'drive',
  'warehouse': 'settle',
  'store': 'settle',
  'factory': 'settle',
  'landmark': 'settle',
  'building-2': 'settle',
  'building': 'settle',
  'package-open': 'hop',
  'package-plus': 'hop',
  'vault': 'press',
  'activity': 'draw',
  'gift': 'hop',
  'book-user': 'people',
  'users-round': 'people',
  'folder-kanban': 'list',
  'notebook-pen': 'edit',
  'shapes': 'tiles',
  'calculator': 'tiles',
  'sliders-horizontal': 'sliders',
  'waypoints': 'pin',
  'file-chart-column': 'bars',
  'wrench': 'turn',
  'tractor': 'drive',
  'map-pin': 'pin',
  'target': 'pin',
  'chart-pie': 'quarter',
  'sun': 'quarter',
  'fan': 'quarter',
  'arrow-left-right': 'swap',
  'circle-question-mark': 'help',
  'info': 'help',
  'external-link': 'nudge',
  'moon': 'rock',
  'egg': 'rock',
  'wheat': 'rock',
  'panel-left': 'panel',
  'qr-code': 'tiles',
  'chart-column': 'bars',
  'chart-line': 'bars',
  'trending-up': 'grow',
  'droplets': 'hop',
  'thermometer': 'hop',
  'pill': 'turn',
  'syringe': 'inject',
  'scale': 'rock',
  // Table toolbars, column menus, and pagination use these Lucide variants.
  'settings-2': 'sliders',
  'mail-plus': 'invite',
  'refresh-ccw': 'reopen',
  'loader': 'loading',
  'loader-circle': 'loading',
  'chevrons-up-down': 'sort',
  'arrow-up': 'up',
  'arrow-down': 'down',
  'arrow-left': 'left',
  'arrow-right': 'right',
  'chevron-left': 'left',
  'chevron-right': 'right',
  'chevrons-left': 'left',
  'chevrons-right': 'right',
  'chevron-down': 'disclose',
  'pin-off': 'unpin',
}

/** Vendored farm glyphs (svg.aapm-livestock, keyed by `data-source`) → archetype. */
export const FARM_ACTIONS: Record<string, string> = {
  'healthicons:zoonoses/animal-chicken': 'peck',
  'iconoven:chicken': 'peck',
  'healthicons:animal-chicken-outline': 'peck',
  'andrsrxn:eggs': 'rock',
  'si:barn-line': 'settle',
  'iconoven:corn-cob': 'rock',
  'fluent-emoji-high-contrast:chicken': 'peck',
  'fluent-emoji-high-contrast:baby-chick': 'hop',
  'fluent-emoji-high-contrast:hatching-chick': 'hop',
  'iconoven:egg': 'rock',
  'hugeicons:eggs': 'rock',
  'iconoven:egg-tray': 'tiles',
  'iconoven:chicken-coop': 'settle',
  'covid:vaccine-protection-virus': 'press',
  'streamline-sharp:decent-work-and-economic-growth-remix': 'growth',
}

const HOST = [
  'button',
  'a[href]',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="tab"]',
].join(', ')

/** Glyphs that are state indicators, not actions: a checkbox tick or a selected-option check. */
const SKIP = [
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[data-slot$="indicator"]',
  '[data-slot="select-item"] > span:first-child',
].join(', ')

const ICON_SVG = 'svg.lucide, svg.aapm-livestock'
const AUTO = 'data-aapm-auto'
/** Longest choreography in icons.css is 720ms; the flag drops a little after. */
export const PLAY_MS = 760

let installed = false
const timers = new WeakMap<SVGElement, ReturnType<typeof setTimeout>>()

function reducedMotion(): boolean {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** The action for a Lucide svg, or undefined when its glyph has no animated meaning. */
export function actionOf(svg: Element): string | undefined {
  if (svg.classList.contains('aapm-livestock'))
    return FARM_ACTIONS[svg.getAttribute('data-source') ?? '']
  for (const cls of svg.classList) {
    if (cls.startsWith('lucide-')) {
      const action = ICON_ACTIONS[cls.slice(7)]
      if (action)
        return action
    }
  }
  return undefined
}

/** Tag one svg (idempotent). Returns true when it is now an auto action icon. */
export function tagIcon(svg: SVGElement): boolean {
  if ((svg.hasAttribute('data-action') && !svg.hasAttribute(AUTO)) || !svg.closest(HOST) || svg.closest(SKIP))
    return false
  const action = actionOf(svg)
  if (!action)
    return false
  svg.setAttribute('data-action', action)
  svg.setAttribute(AUTO, '')
  // Normalize drawing length; a fixed dash length hid short scan/route strokes.
  svg.querySelectorAll('path, line, polyline, polygon, rect, circle, ellipse').forEach((part, i) => {
    if (action === 'route')
      part.setAttribute('pathLength', '1')
    ;(part as SVGElement).style.setProperty('--part', String(i))
  })
  if (['scanQr', 'scanBarcode'].includes(action) && !svg.querySelector('[data-scan-beam]')) {
    const beam = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    beam.setAttribute('d', 'M5 12h14')
    beam.setAttribute('data-scan-beam', '')
    svg.append(beam)
  }
  return true
}

function scan(root: ParentNode) {
  if (root instanceof SVGElement && root.matches(ICON_SVG))
    tagIcon(root)
  root.querySelectorAll<SVGElement>(ICON_SVG).forEach(tagIcon)
}

function isDisabled(host: Element): boolean {
  return host.matches(':disabled, [aria-disabled="true"], [data-disabled]')
}

/** Play one choreography; a play already running is left to finish (no stutter on re-hover). */
export function playIcon(svg: SVGElement): void {
  if (svg.getAttribute('data-playing') === 'true' || reducedMotion())
    return
  svg.setAttribute('data-playing', 'true')
  clearTimeout(timers.get(svg))
  timers.set(svg, setTimeout(() => svg.setAttribute('data-playing', 'false'), PLAY_MS))
}

/** Auto icons that belong to this host — not to a nested host inside it. */
function iconsOf(host: Element): SVGElement[] {
  return Array.from(host.querySelectorAll<SVGElement>(`svg[${AUTO}]`))
    .filter(svg => svg.closest(HOST) === host)
}

export function playHost(host: Element): void {
  if (!isDisabled(host))
    iconsOf(host).forEach(playIcon)
}

const setupActionIcons: MotionModule = () => {
  if (installed || typeof document === 'undefined' || typeof MutationObserver === 'undefined' || !document.body)
    return
  installed = true
  scan(document.body)
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes' && record.target instanceof SVGElement) {
        tagIcon(record.target)
        continue
      }
      record.addedNodes.forEach((node) => {
        if (node instanceof Element)
          scan(node)
      })
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })

  // Hover: once per entry into the host (pointerover bubbles; ignore moves between its children).
  document.addEventListener('pointerover', (event) => {
    if (event.pointerType === 'touch' || !(event.target instanceof Element))
      return
    const host = event.target.closest(HOST)
    if (!host)
      return
    const from = event.relatedTarget
    if (from instanceof Node && host.contains(from))
      return
    playHost(host)
  }, { passive: true })
  // Press also works after a mouse has rested on a button; focus covers keyboard discovery.
  document.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !(event.target instanceof Element))
      return
    const host = event.target.closest(HOST)
    if (host)
      playHost(host)
  }, { passive: true })
  document.addEventListener('focusin', (event) => {
    if (!(event.target instanceof Element))
      return
    const host = event.target.closest(HOST)
    if (host)
      playHost(host)
  })
  // Keyboard activation (Enter / Space) clicks with detail 0.
  document.addEventListener('click', (event) => {
    if (event.detail !== 0 || !(event.target instanceof Element))
      return
    const host = event.target.closest(HOST)
    if (host)
      playHost(host)
  })
}

export default setupActionIcons
