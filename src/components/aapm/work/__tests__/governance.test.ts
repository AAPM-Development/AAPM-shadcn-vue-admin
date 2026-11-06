// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import type { ActivityEntry } from '@/design-system/contracts'

import ApprovalDelegation from '../ApprovalDelegation.vue'
import FeatureGate from '../FeatureGate.vue'
import ProgressLog from '../ProgressLog.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } }
const at = new Date('2026-11-05T08:00:00+07:00')

describe('progressLog / ApprovalDelegation / FeatureGate', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('progress log never edits earlier entries', async () => {
    const entries: ActivityEntry[] = [
      { id: 'p1', kind: 'progress', actor: 'Andi', at, reason: 'Vaksin ND kandang A1: 4.200 ekor' },
      { id: 'p2', kind: 'progress', actor: 'Andi', at, reason: 'Vaksin ND kandang A1: 4.250 ekor', corrects: 'p1' },
    ]
    const w = mount(ProgressLog, { props: { entries }, attachTo: document.body })
    expect(w.findAll('li[data-activity] input, li[data-activity] textarea')).toHaveLength(0)
    expect(w.text()).toContain('Koreksi atas')
    await w.get('textarea').setValue('Vaksin ND kandang A2 selesai')
    await w.get('form').trigger('submit')
    expect(w.emitted('append')![0]).toEqual([{ note: 'Vaksin ND kandang A2 selesai', corrects: undefined }])
  })

  // Final review #1: "Batal" defaulted to type=submit inside the form, so cancelling a correction
  // appended the draft as a permanent, uncorrected entry.
  it('cancelling a correction appends nothing', async () => {
    const entries: ActivityEntry[] = [{ id: 'p1', kind: 'progress', actor: 'Andi', at, reason: 'Vaksin ND kandang A1: 4.200 ekor' }]
    const w = mount(ProgressLog, { props: { entries }, attachTo: document.body })
    await w.get('li[data-activity] button').trigger('click')
    await w.get('textarea').setValue('draft note')
    const cancel = w.findAll('button').find(b => b.text() === 'Batal')!
    expect(cancel.attributes('type')).toBe('button')
    ;(cancel.element as HTMLButtonElement).click()
    await w.vm.$nextTick()
    expect(w.emitted('append')).toBeUndefined()
    expect(w.text()).not.toContain('Mengoreksi:')
  })

  it('no approver renders the authority blocker', () => {
    const w = mount(ApprovalDelegation, { props: { approvers: [] }, attachTo: document.body })
    expect(w.text()).toContain('Tidak ada approver yang berwenang')
  })

  it('delegation shows "atas nama" and its window', () => {
    const w = mount(ApprovalDelegation, {
      props: {
        approvers: [{ name: 'Rina Sari', role: 'Manajer gudang', onBehalfOf: 'Doni Pratama' }],
        delegations: [{ delegator: 'Doni Pratama', delegate: 'Rina Sari', from: new Date('2026-11-04T00:00:00+07:00'), to: new Date('2026-11-08T00:00:00+07:00'), scope: 'Penerimaan barang' }],
      },
      attachTo: document.body,
    })
    expect(w.text()).toContain('atas nama Doni Pratama')
    expect(w.text()).toMatch(/4 Nov.*8 Nov/)
  })

  it('feature gate disabled shows reason, settings link and scope', () => {
    const w = mount(FeatureGate, {
      props: { availability: { feature: 'Posting otomatis', enabled: false, reason: 'Akun persediaan belum dipetakan.', setting: { key: 'inventory.account', scope: 'company', to: '/settings' } } },
      slots: { default: '<button>Posting</button>' },
      global: { stubs },
      attachTo: document.body,
    })
    expect(w.text()).toContain('Akun persediaan belum dipetakan.')
    expect(w.text()).toContain('Perusahaan')
    expect(w.get('a').attributes('href')).toBe('/settings')
    expect(w.find('[data-availability="disabled"]').exists()).toBe(true)
  })

  it('feature gate enabled renders the slot unchanged', () => {
    const w = mount(FeatureGate, { props: { availability: { feature: 'Posting otomatis', enabled: true } }, slots: { default: '<button id="slot">Posting</button>' } })
    expect(w.html()).toContain('id="slot"')
    expect(w.find('[data-availability]').exists()).toBe(false)
  })
})
