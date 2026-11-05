/**
 * Writes docs/design-system/CAPABILITY_MATRIX.md from the capability registry.
 * Run: pnpm capabilities:doc   (node --experimental-strip-types scripts/capabilities-doc.ts)
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import process from 'node:process'

import { CAPABILITIES } from '../src/design-system/capabilities.ts'
import { renderCapabilityMatrix } from '../src/design-system/capability-doc.ts'

const target = new URL('../docs/design-system/CAPABILITY_MATRIX.md', import.meta.url)
mkdirSync(new URL('.', target), { recursive: true })
writeFileSync(target, renderCapabilityMatrix(CAPABILITIES))
process.stdout.write(`capabilities:doc: wrote ${CAPABILITIES.length} rows to ${target.pathname}\n`)
