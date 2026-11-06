// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import type { CorrectionField } from '@/design-system/contracts'

import CorrectionForm from '../CorrectionForm.vue'

const fields: CorrectionField[] = [
  { key: 'qty', label: 'Kuantitas baris 2', unit: 'kg', original: '1.200', kind: 'number' },
  { key: 'lot', label: 'Lot baris 2', original: 'KL-2611-10', kind: 'text' },
]
const mountForm = () => mount(CorrectionForm, { props: { fields, actor: 'Yulia Fitri' }, attachTo: document.body })
const submitAction = () => document.body.querySelector('[data-availability]') as HTMLButtonElement
const reasonOf = () => document.getElementById(submitAction().getAttribute('aria-describedby') ?? '')?.textContent

describe('correctionForm', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('unchanged fields produce no revision', async () => {
    const w = mountForm()
    await w.get('input[name="qty"]').setValue('1.200')
    expect(w.emitted('preview')?.at(-1)?.[0]).toEqual([])
  })

  it('a changed number becomes a revision with units', async () => {
    const w = mountForm()
    await w.get('input[name="qty"]').setValue('1.250,5')
    expect(w.emitted('preview')!.at(-1)![0]).toMatchObject([{ field: 'Kuantitas baris 2', before: '1.200 kg', after: '1.250,5 kg' }])
    expect(w.get('ins').text()).toBe('1.250,5 kg')
  })

  // Final review #2: `after` was rebuilt from the float — exponent notation crashed the form on
  // 7+ decimals, rounded 0,00000015 to "0,0000" and lost digits on long integers.
  it.each([
    ['0,0000001', '0,0000001 kg'],
    ['0,00000015', '0,00000015 kg'],
    ['12.345.678.901.234.567', '12.345.678.901.234.567 kg'],
    ['1200,50', '1.200,5 kg'],
    ['0001250', '1.250 kg'],
  ])('a corrected number %s keeps exactly what was typed', async (typed, after) => {
    const w = mountForm()
    await w.get('input[name="qty"]').setValue(typed)
    expect(w.emitted('preview')!.at(-1)![0]).toMatchObject([{ after }])
  })

  it('a decimal that differs only far past the float precision is still a change', async () => {
    const w = mount(CorrectionForm, { props: { fields: [{ key: 'qty', label: 'Kuantitas', original: '1', kind: 'number' }] }, attachTo: document.body })
    await w.get('input[name="qty"]').setValue('1,00000000000000000001')
    expect(w.emitted('preview')!.at(-1)![0]).toMatchObject([{ before: '1', after: '1,00000000000000000001' }])
    await w.get('input[name="qty"]').setValue('1,000')
    expect(w.emitted('preview')!.at(-1)![0]).toEqual([])
  })

  it('ambiguous input shows an inline error and no revision', async () => {
    const w = mountForm()
    await w.get('input[name="qty"]').setValue('1.2.3')
    expect(w.text()).toContain('Format angka tidak jelas')
    expect(w.emitted('preview')!.at(-1)![0]).toEqual([])
  })

  it('submit unavailable until a change and a reason', async () => {
    const w = mountForm()
    expect(submitAction().getAttribute('aria-disabled')).toBe('true')
    expect(reasonOf()).toContain('Ubah minimal satu nilai')
    await w.get('input[name="qty"]').setValue('1.250,5')
    expect(reasonOf()).toContain('Isi alasan koreksi')
    await w.get('textarea').setValue('Timbang ulang di gudang')
    expect(submitAction().getAttribute('aria-disabled')).toBeNull()
    submitAction().click()
    const [payload] = w.emitted('submit')!.at(-1)! as [{ revisions: { reason?: string }[], reason: string }]
    expect(payload.reason).toBe('Timbang ulang di gudang')
    expect(payload.revisions[0]!.reason).toBe('Timbang ulang di gudang')
  })
})

describe('correctionForm submit path', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })
  it('one click submits exactly once', async () => {
    const w = mount(CorrectionForm, { props: { fields, actor: 'Yulia Fitri' }, attachTo: document.body })
    await w.get('input[name="qty"]').setValue('1.250,5')
    await w.get('textarea').setValue('Timbang ulang')
    ;(document.body.querySelector('[data-availability]') as HTMLButtonElement).click()
    expect(w.emitted('submit')).toHaveLength(1)
  })
})
