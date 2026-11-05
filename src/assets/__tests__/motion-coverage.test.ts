// @vitest-environment happy-dom
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { ANIMATED_ACTIONS } from '@/components/aapm/icon/animated/actions'
import { FARM_ACTIONS, ICON_ACTIONS } from '@/plugins/motion/action-icons.module'
import { MOTION_MODULE_NAMES } from '@/plugins/motion/setup'

/**
 * Every interactive shadcn-vue primitive must have a micro-interaction in assets/motion.css.
 * "Interactive" = something a person presses, opens, types into, or that appears in response.
 * Structural slots (roots, groups, labels, separators, headers…) are intentionally excluded.
 */
const UI_DIR = join(process.cwd(), 'src/components/ui')
const MOTION_DIR = join(process.cwd(), 'src/assets/motion')
const FEATURE_FILES = ['caret.css', 'table.css', 'icons.css', 'semantic-icons.css', 'toast.css', 'select.css', 'controls.css', 'menus.css', 'pickers.css', 'charts.css']
const BASE_CSS = readFileSync(join(process.cwd(), 'src/assets/motion.css'), 'utf8')
/** motion.css plus every feature stylesheet in src/assets/motion/ */
const MOTION_CSS = [BASE_CSS, ...readdirSync(MOTION_DIR).filter(f => f.endsWith('.css')).map(f => readFileSync(join(MOTION_DIR, f), 'utf8'))].join('\n')

const INTERACTIVE_SUFFIX = ['-trigger', '-close', '-button', '-link', '-action', '-overlay', '-handle', '-thumb', '-indicator', '-slot', '-next', '-previous', '-first', '-last', '-checkbox-item', '-radio-item', '-sub-trigger', '-sub-content', '-error', '-message', '-input', '-control', '-range']
const INTERACTIVE_EXACT = new Set(['button', 'checkbox', 'switch', 'toggle', 'toggle-group-item', 'tabs-trigger', 'select-item', 'dropdown-menu-item', 'context-menu-item', 'menubar-item', 'combobox-item', 'command-item', 'item', 'input', 'textarea', 'native-select', 'input-otp', 'pin-input', 'table-row', 'popover-content', 'hover-card-content', 'tooltip-content', 'select-content', 'dropdown-menu-content', 'context-menu-content', 'menubar-content', 'combobox-list', 'navigation-menu-content', 'navigation-menu-viewport', 'dialog-content', 'alert-dialog-content', 'sheet-content', 'drawer-content', 'tabs-content', 'accordion-content', 'collapsible-content', 'progress-indicator', 'sidebar-rail', 'sidebar-menu-button', 'sidebar-menu-sub-button', 'message', 'bubble', 'bubble-reactions', 'empty-content', 'scroll-area-scrollbar', 'marker-content', 'calendar-cell-trigger', 'radio-group-item'])

function vueFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? vueFiles(join(dir, entry.name)) : entry.name.endsWith('.vue') ? [join(dir, entry.name)] : [],
  )
}

const slots = new Set(vueFiles(UI_DIR).flatMap(file => [...readFileSync(file, 'utf8').matchAll(/data-slot="([a-z0-9-]+)"/g)].map(m => m[1]!)))
const interactive = [...slots].filter(s => INTERACTIVE_EXACT.has(s) || INTERACTIVE_SUFFIX.some(suffix => s.endsWith(suffix))).sort()
const covered = new Set([...MOTION_CSS.matchAll(/data-slot='([a-z0-9-]+)'/g)].map(m => m[1]!))

/** Every Lucide glyph the app imports outside components/ui, as its `lucide-<name>` key. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      return ['ui', '__tests__'].includes(entry.name) ? [] : sourceFiles(path)
    return /\.(?:vue|ts)$/.test(entry.name) && !entry.name.startsWith('auto-import') ? [path] : []
  })
}
const kebab = (name: string) => name.replace(/Icon$/, '').replace(/(?<=[a-z])(\d)/g, '-$1').replace(/(?<=[a-z0-9])([A-Z])/g, '-$1').toLowerCase()
const importedGlyphs = new Set(sourceFiles(join(process.cwd(), 'src')).flatMap(file =>
  [...readFileSync(file, 'utf8').matchAll(/import \{([^}]+)\} from '@lucide\/vue'/g)]
    .flatMap(m => m[1]!.split(',').map(s => s.trim().split(' as ')[0]!))
    .filter(name => /^[A-Z]/.test(name) && name !== 'LucideIcon')
    .map(kebab),
))

describe('micro-interaction coverage (assets/motion.css)', () => {
  it('animates every Lucide glyph the app imports (no icon without a motion)', () => {
    expect(importedGlyphs.size).toBeGreaterThan(150)
    expect([...importedGlyphs].filter(glyph => !(glyph in ICON_ACTIONS)).sort()).toEqual([])
  })

  it('finds the primitives it is meant to guard', () => {
    expect(interactive.length).toBeGreaterThan(100)
  })

  it('gives every interactive primitive a motion rule', () => {
    expect(interactive.filter(slot => !covered.has(slot))).toEqual([])
  })

  it('reads every motion stylesheet', () => {
    const present = readdirSync(MOTION_DIR)
    for (const file of FEATURE_FILES)
      expect(present, file).toContain(file)
    expect(MOTION_CSS).toContain('aapm-pop-in')
  })

  it('keeps all motion behind prefers-reduced-motion', () => {
    const outside = BASE_CSS.split('@media (prefers-reduced-motion: no-preference)')[0]!
    expect(outside).not.toMatch(/\[data-slot=/)
  })

  it('every action icon has an animated variant', () => {
    expect(Object.keys(ANIMATED_ACTIONS)).toEqual(expect.arrayContaining(['like', 'copy', 'share', 'refresh', 'print', 'delete']))
  })

  it('every glyph the action-icons module maps has a choreography in icons.css or semantic-icons.css', () => {
    const icons = ['icons.css', 'semantic-icons.css'].map(file => readFileSync(join(MOTION_DIR, file), 'utf8')).join('\n')
    const actions = new Set([...Object.values(ICON_ACTIONS), ...Object.values(FARM_ACTIONS), ...Object.keys(ANIMATED_ACTIONS)])
    const missing = [...actions].filter(action => !icons.includes(`[data-action='${action}']`) && !icons.includes(`[data-action='${action}'],`))
    expect(missing).toEqual([])
  })

  it('every toast type is styled', () => {
    for (const type of ['success', 'info', 'warning', 'error'])
      expect(MOTION_CSS).toContain(`[data-type='${type}']`)
  })

  it('all motion modules are registered', () => {
    expect(MOTION_MODULE_NAMES).toEqual(expect.arrayContaining([
      'action-icons',
      'calendar',
      'caret',
      'layout-stability',
      'radio-cards',
      'select-pill',
      'slider',
      'tabs',
    ]))
  })

  it('keeps every feature stylesheet\'s motion behind prefers-reduced-motion', () => {
    for (const file of readdirSync(MOTION_DIR).filter(f => f.endsWith('.css'))) {
      const text = readFileSync(join(MOTION_DIR, file), 'utf8')
      // Outside the no-preference blocks there may be state styling, but no animation / transition.
      const outside = text.split(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}/).join('')
      const offenders = outside.split('\n').filter(line => /^\s*(?:animation|transition)\s*:/.test(line) && !/:\s*none/.test(line))
      expect(offenders, file).toEqual([])
    }
  })
})
