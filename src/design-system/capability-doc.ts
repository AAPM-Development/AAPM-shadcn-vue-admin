/**
 * Labels and the Markdown rendering of the capability matrix.
 * Kept free of runtime imports so `node --experimental-strip-types scripts/capabilities-doc.ts` can load it.
 */
import type { Capability, CapabilitySource, CapabilityStatus, Subproject } from './capabilities'

export const STATUS_LABEL: Record<CapabilityStatus, string> = {
  'ada': 'Ada',
  'sebagian': 'Sebagian',
  'belum': 'Belum',
  'milik-produk': 'Milik produk',
}
export const SOURCE_LABEL: Record<CapabilitySource, string> = {
  'ecosystem': 'AAPM Ecosystem',
  'erp-route': 'ERP · rute',
  'erp-platform': 'ERP · platform',
}
export const STATUSES = ['ada', 'sebagian', 'belum', 'milik-produk'] as const satisfies readonly CapabilityStatus[]
export const SUBPROJECTS = ['B1', 'B2', 'B3', 'B4'] as const satisfies readonly Subproject[]

const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2 } as const

/** Sub-project, then priority, then ID: the order the tab and the doc show rows in. */
export function sortCapabilities(rows: readonly Capability[]): Capability[] {
  return [...rows].sort((a, b) =>
    a.subproject.localeCompare(b.subproject)
    || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    || a.id.localeCompare(b.id, 'en', { numeric: true }))
}

const cell = (text: string) => text.replaceAll('|', '\\|').replaceAll('\n', ' ')

export function renderCapabilityMatrix(rows: readonly Capability[]): string {
  const count = (status: CapabilityStatus, sub?: Subproject) => rows.filter(r => r.status === status && (!sub || r.subproject === sub)).length
  const summary = [
    `| Status | ${SUBPROJECTS.join(' | ')} | Total |`,
    `|---|${SUBPROJECTS.map(() => '---:').join('|')}|---:|`,
    ...STATUSES.map(s => `| ${STATUS_LABEL[s]} | ${SUBPROJECTS.map(b => count(s, b)).join(' | ')} | ${count(s)} |`),
    `| **Total** | ${SUBPROJECTS.map(b => rows.filter(r => r.subproject === b).length).join(' | ')} | ${rows.length} |`,
  ]
  const table = [
    '| ID | Kebutuhan | Sumber | Status | Sub-proyek | Prioritas | Demo | Catatan |',
    '|---|---|---|---|---|---|---|---|',
    ...sortCapabilities(rows).map(r => `| ${r.id} | ${cell(r.title)} | ${SOURCE_LABEL[r.source]} | ${STATUS_LABEL[r.status]} | ${r.subproject} | ${r.priority} | ${r.demo ? `\`${r.demo}\`` : '—'} | ${cell(r.note ?? '')} |`),
  ]
  return [
    '# Matriks kapabilitas AAPM UI (Vue)',
    '',
    '> Generated from `src/design-system/capabilities.ts` by `pnpm capabilities:doc` — do not edit by hand.',
    '',
    `${rows.length} kebutuhan: AAPM Ecosystem (UI-*), ERP rute (R01–R16), dan ERP platform (PC01–PC22). Status mengikuti aturan spec B1 (\`docs/superpowers/specs/2026-11-05-aapm-vue-ds-b1-foundation-design.md\`).`,
    '',
    '## Ringkasan',
    '',
    ...summary,
    '',
    '## Semua kebutuhan',
    '',
    ...table,
    '',
  ].join('\n')
}
