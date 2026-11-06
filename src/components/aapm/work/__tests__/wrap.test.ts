// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import Entity360 from '../Entity360.vue'
import FeatureGate from '../FeatureGate.vue'
import ReadinessReview from '../ReadinessReview.vue'
import { wrapButtonClass } from '../wrap'

// Layout audit (B2b T11, --stress longword at 375px): nowrap buttons, a tab strip and an inline-flex
// link set the min-content of their ancestor grids and pushed the page sideways (#41, #98, #101).
const DIR = join(process.cwd(), 'src/components/aapm/work')
const stubs = { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } }

describe('long labels wrap instead of widening the layout', () => {
  it('wrapButtonClass keeps each size\'s single-line height as the minimum', () => {
    expect(wrapButtonClass('xs')).toContain('min-h-6')
    expect(wrapButtonClass('xs')).toContain('py-1')
    expect(wrapButtonClass('sm')).toContain('min-h-8')
    expect(wrapButtonClass('sm')).toContain('py-1.5')
    expect(wrapButtonClass()).toContain('min-h-9')
    expect(wrapButtonClass('lg')).toContain('min-h-10')
    for (const size of ['xs', 'sm', 'default', 'lg'] as const)
      expect(wrapButtonClass(size).split(' ')).toEqual(expect.arrayContaining(['h-auto', 'max-w-full', 'whitespace-normal', 'wrap-anywhere']))
    expect(wrapButtonClass('icon')).toBe('')
  })

  it('every text Button in the work components uses wrapButtonClass', () => {
    const KIT = join(process.cwd(), 'src/pages/ui-kit/components')
    const files = [...readdirSync(DIR).filter(f => f.endsWith('.vue')).map(f => join(DIR, f)), join(KIT, 'kit-lifecycle.vue'), join(KIT, 'kit-correction-flow.vue')]
    for (const file of files) {
      const tags = readFileSync(file, 'utf8').match(/<Button\b[^>]*>/g) ?? []
      for (const tag of tags)
        expect(tag, `${file}: ${tag}`).toContain('wrapButtonClass(')
    }
  })

  it('readinessReview status and the satisfied toggle wrap', () => {
    const w = mount(ReadinessReview, { props: { readiness: { subject: 'Koreksi GRN-2611-0086', result: 'blocked', blockers: [{ code: 'PI', title: 'Faktur tertaut', reason: 'Baris sudah difakturkan.' }], satisfied: ['Periode terbuka'] } } })
    expect(w.get('[role="status"]').classes()).toEqual(expect.arrayContaining(['flex', 'min-w-0', 'flex-wrap']))
    expect(w.get('[data-slot="collapsible-trigger"]').classes()).toEqual(expect.arrayContaining(['max-w-full', 'wrap-anywhere']))
  })

  it('entity360 tabs scroll inside their strip', () => {
    const w = mount(Entity360, { props: { title: 'GRN-2611-0086', subtitle: 'Penerimaan barang' }, global: { stubs } })
    expect(w.get('[data-slot="tabs-list"]').classes()).toEqual(expect.arrayContaining(['max-w-full', 'overflow-x-auto']))
  })

  it('featureGate settings link wraps', () => {
    const w = mount(FeatureGate, {
      props: { availability: { feature: 'Posting otomatis', enabled: false, reason: 'Akun belum dipetakan.', setting: { key: 'inventory.account', scope: 'company', to: '/settings' } } },
      global: { stubs },
    })
    expect(w.get('a').classes()).toEqual(expect.arrayContaining(['max-w-full', 'wrap-anywhere']))
  })
})
