import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { KIT_ANCHOR_TAB, KIT_TAB_FILES } from '@/pages/ui-kit/components/kit-anchors'

import { CAPABILITIES } from '../capabilities'
import { renderCapabilityMatrix } from '../capability-doc'

const ROOT = process.cwd()
const KIT_DIR = join(ROOT, 'src/pages/ui-kit/components')
const kit = readdirSync(KIT_DIR).filter(f => f.endsWith('.vue')).map(f => readFileSync(join(KIT_DIR, f), 'utf8')).join('\n')
const range = (prefix: string, n: number, pad = 2) => Array.from({ length: n }, (_, i) => `${prefix}${String(i + 1).padStart(pad, '0')}`)

describe('capability registry (83 rows: Ecosystem + ERP)', () => {
  it('has exactly the 83 source rows, unique', () => {
    expect(CAPABILITIES).toHaveLength(83)
    expect(new Set(CAPABILITIES.map(c => c.id)).size).toBe(83)
    const eco = CAPABILITIES.filter(c => c.source === 'ecosystem').map(c => c.id)
    expect(eco.sort()).toEqual([...range('UI-DAT-', 17, 3), ...range('UI-FND-', 15, 3), ...range('UI-FRM-', 12, 3), 'UI-WRK-READINESS'].sort())
    expect(CAPABILITIES.filter(c => c.source === 'erp-route').map(c => c.id)).toEqual(range('R', 16))
    expect(CAPABILITIES.filter(c => c.source === 'erp-platform').map(c => c.id)).toEqual(range('PC', 22))
  })

  it('implemented rows point at real files and real demo anchors', () => {
    for (const c of CAPABILITIES.filter(c => c.status === 'ada' || c.status === 'sebagian')) {
      expect(c.components.length, c.id).toBeGreaterThan(0)
      for (const file of c.components)
        expect(existsSync(join(ROOT, file)), `${c.id}: ${file}`).toBe(true)
      // `ada` always has a live demo; a `sebagian` row may lack one, and then its note says so.
      if (c.status === 'ada' || c.demo) {
        expect(c.demo, c.id).toMatch(/^\/ui-kit#[a-z0-9-]+$/)
        expect(kit, `${c.id} demo ${c.demo}`).toContain(`id="${c.demo!.split('#')[1]}"`)
      }
      else {
        expect(c.note, `${c.id} note must name the missing demo`).toMatch(/demo/i)
      }
    }
  })

  it('belum and milik-produk rows claim no components', () => {
    for (const c of CAPABILITIES.filter(c => c.status === 'belum' || c.status === 'milik-produk'))
      expect(c.components, c.id).toEqual([])
  })

  it('sebagian and milik-produk rows explain themselves', () => {
    for (const c of CAPABILITIES.filter(c => c.status === 'sebagian' || c.status === 'milik-produk'))
      expect(c.note?.trim(), c.id).toBeTruthy()
  })

  it('follows the spec routing', () => {
    const sub = (id: string) => CAPABILITIES.find(c => c.id === id)!.subproject
    for (const id of [...range('R', 16), 'UI-DAT-003', 'UI-FRM-012', 'PC06', 'PC07', 'PC08', 'PC10', 'PC12', 'PC15', 'PC16'])
      expect(sub(id), id).toBe('B3')
    for (const id of ['UI-DAT-002', 'UI-FND-009', 'UI-FND-015', 'PC13', 'PC14', 'PC19', 'PC18', 'PC20', 'PC21', 'PC22'])
      expect(sub(id), id).toBe('B4')
    for (const id of ['UI-FND-002', 'UI-FND-003', 'UI-FND-004', 'UI-FND-014', 'UI-DAT-010', 'UI-DAT-015', 'UI-FRM-008', 'UI-WRK-READINESS', 'PC05', 'PC09', 'PC11', 'PC17'])
      expect(sub(id), id).toBe('B2')
    // "Expected already met" rows: B1 when the rule says ada, otherwise B2
    for (const c of CAPABILITIES.filter(c => c.subproject === 'B1'))
      expect(c.status, c.id).toBe('ada')
  })

  it('b1 owns the brand source and status semantics', () => {
    expect(CAPABILITIES.find(c => c.id === 'UI-FND-012')).toMatchObject({ subproject: 'B1', status: 'ada' })
    expect(CAPABILITIES.find(c => c.id === 'UI-DAT-008')).toMatchObject({ subproject: 'B1', status: 'ada' })
  })

  it('the generated matrix doc is current', () => {
    expect(readFileSync(join(ROOT, 'docs/design-system/CAPABILITY_MATRIX.md'), 'utf8')).toBe(renderCapabilityMatrix(CAPABILITIES))
  })

  it('marks partly met rows honestly (final review)', () => {
    for (const id of ['UI-FRM-001', 'UI-FRM-002', 'UI-FND-008', 'UI-FND-002'])
      expect(CAPABILITIES.find(c => c.id === id), id).toMatchObject({ status: 'sebagian', subproject: 'B2' })
    // B1's six plus the thirteen rows B2b delivers in full (PC11 stays sebagian).
    const B1_ADA = ['UI-DAT-001', 'UI-DAT-006', 'UI-DAT-008', 'UI-FND-012', 'UI-FRM-003', 'UI-FRM-005']
    const B2B_ADA = ['UI-WRK-READINESS', 'UI-FRM-008', 'UI-FRM-007', 'UI-FRM-011', 'UI-FRM-010', 'UI-DAT-010', 'UI-DAT-017', 'UI-DAT-007', 'UI-DAT-011', 'UI-DAT-012', 'PC05', 'PC09', 'PC17']
    expect(CAPABILITIES.filter(c => c.status === 'ada').map(c => c.id).sort()).toEqual([...B1_ADA, ...B2B_ADA].sort())
  })

  it('every demo link opens the tab that holds its anchor', () => {
    for (const c of CAPABILITIES.filter(c => c.demo)) {
      const anchor = c.demo!.split('#')[1]!
      const tab = KIT_ANCHOR_TAB[anchor]
      expect(tab, `${c.id}: #${anchor} has no tab`).toBeTruthy()
      const files = KIT_TAB_FILES[tab!].map(f => readFileSync(join(KIT_DIR, f), 'utf8')).join('\n')
      expect(files, `${c.id}: #${anchor} is not in tab ${tab}`).toContain(`id="${anchor}"`)
    }
  })

  it('every file a tab lists is actually rendered in that tab', () => {
    const index = readFileSync(join(ROOT, 'src/pages/ui-kit/index.vue'), 'utf8')
    for (const [tab, files] of Object.entries(KIT_TAB_FILES)) {
      for (const f of files) {
        const siblings = files.filter(s => s !== f).map(s => readFileSync(join(KIT_DIR, s), 'utf8'))
        const imported = [index, ...siblings].some(src => src.includes(`/${f}'`))
        expect(imported, `${tab}: ${f} is listed but never imported`).toBe(true)
      }
    }
  })

  it('b2b rows are delivered', () => {
    const B2B = ['UI-WRK-READINESS', 'UI-FRM-008', 'UI-FRM-007', 'UI-FRM-011', 'UI-FRM-010', 'UI-DAT-010', 'UI-DAT-017', 'UI-DAT-007', 'UI-DAT-011', 'UI-DAT-012', 'PC05', 'PC09', 'PC11', 'PC17']
    for (const id of B2B) {
      const c = CAPABILITIES.find(c => c.id === id)!
      expect(['ada', 'sebagian'], id).toContain(c.status)
      if (c.status === 'ada')
        expect(c.components.some(f => f.startsWith('src/components/aapm/work/')), id).toBe(true)
    }
    expect(CAPABILITIES.find(c => c.id === 'PC11')).toMatchObject({ status: 'sebagian' })
    expect(CAPABILITIES.find(c => c.id === 'PC11')!.note).toMatch(/backend/i)
  })
})
