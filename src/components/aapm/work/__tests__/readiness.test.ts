// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import type { Readiness } from '@/design-system/contracts'

import BlockerList from '../BlockerList.vue'
import ReadinessReview from '../ReadinessReview.vue'

const blockers = [
  { code: 'PI', title: 'Faktur PI-2611-031 sudah memakai baris 2', reason: 'Baris yang sudah difakturkan tidak bisa dikoreksi.', resolution: 'Batalkan tautan faktur', source: { label: 'Buka faktur', intent: 'open-pi' } },
  { code: 'PER', title: 'Periode Oktober sudah ditutup', reason: 'Tanggal bisnis berada di periode tertutup.' },
]
const base: Readiness = { subject: 'Koreksi GRN-2611-0086', result: 'blocked', blockers, satisfied: ['Stok lot cukup', 'Pengguna berwenang'], next: { label: 'Buka koreksi', intent: 'open' } }

describe('blockerList / ReadinessReview', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps the consumer\'s blocker order', () => {
    const w = mount(BlockerList, { props: { blockers: [...blockers].reverse() } })
    const titles = w.findAll('li [data-blocker-title]').map(t => t.text())
    expect(titles).toEqual([blockers[1]!.title, blockers[0]!.title])
  })

  it('a long resolution label wraps and the text column cannot grow past the row', () => {
    const w = mount(BlockerList, { props: { blockers } })
    expect(w.get('li > div').classes()).toContain('grid-cols-[minmax(0,1fr)]')
    expect(w.get('li button').classes()).toEqual(expect.arrayContaining(['max-w-full', 'whitespace-normal', 'wrap-anywhere', 'h-auto', 'min-h-8']))
  })

  it('empty blockers renders no list', () => {
    expect(mount(BlockerList, { props: { blockers: [] } }).find('ol').exists()).toBe(false)
  })

  it('open emits the blocker\'s source', async () => {
    const w = mount(BlockerList, { props: { blockers } })
    await w.get('button').trigger('click')
    expect(w.emitted('open')![0]).toEqual([blockers[0]!.source])
  })

  it('shows the result as text, not colour only', () => {
    const w = mount(ReadinessReview, { props: { readiness: base }, attachTo: document.body })
    expect(w.text()).toContain('Terblokir (2)')
    expect(w.find('[data-semantic-state="work.blocked"]').exists()).toBe(true)
    expect(w.text()).toContain('Koreksi GRN-2611-0086')
  })

  it('next is available only when ready', async () => {
    const blocked = mount(ReadinessReview, { props: { readiness: base }, attachTo: document.body })
    const action = blocked.get('[data-availability]')
    expect(action.attributes('aria-disabled')).toBe('true')
    expect(document.getElementById(action.attributes('aria-describedby')!)?.textContent).toContain(blockers[0]!.title)
    await action.trigger('click')
    expect(blocked.emitted('next')).toBeUndefined()

    const ready = mount(ReadinessReview, { props: { readiness: { ...base, result: 'ready', blockers: [] } }, attachTo: document.body })
    await ready.get('[data-availability]').trigger('click')
    expect(ready.emitted('next')).toHaveLength(1)
    expect(ready.text()).toContain('Siap')
  })

  it('satisfied conditions collapse under "Syarat terpenuhi (n)"', () => {
    const w = mount(ReadinessReview, { props: { readiness: base }, attachTo: document.body })
    expect(w.text()).toContain('Syarat terpenuhi (2)')
  })
})
