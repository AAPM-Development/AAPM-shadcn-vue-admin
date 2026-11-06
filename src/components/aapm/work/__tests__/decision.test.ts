// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import type { DecisionContext } from '@/design-system/contracts'

import DecisionForm from '../DecisionForm.vue'

const context: DecisionContext = {
  document: 'Koreksi GRN-2611-0086',
  company: 'PT Agung Abadi Putra Mandiri',
  options: [
    { value: 'approve', label: 'Setujui', tone: 'approve', reasonRequired: false, effect: 'Kuantitas baris 2 menjadi 1.250,5 kg dan jurnal stok disesuaikan.' },
    { value: 'reject', label: 'Tolak', tone: 'reject', reasonRequired: true, effect: 'Koreksi ditolak; dokumen tetap seperti semula.' },
  ],
}
const body = () => document.body
const button = (text: string) => [...body().querySelectorAll('button')].find(b => b.textContent?.trim() === text) as HTMLButtonElement
async function choose(label: string) {
  const radio = [...body().querySelectorAll('[role="radio"]')].find(r => r.closest('label')?.textContent?.includes(label)) as HTMLElement
  radio.click()
  await nextTick()
}

describe('decisionForm', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('reason required per option', async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    mount(DecisionForm, { props: { context, submit }, attachTo: body() })
    await choose('Tolak')
    button('Lanjutkan').click()
    await nextTick()
    expect(body().querySelector('[data-slot="field-error"]')?.textContent).toContain('Alasan wajib')
    expect(document.activeElement?.tagName).toBe('TEXTAREA')
    expect(body().querySelector('[role="alertdialog"]')).toBeNull()
    expect(submit).not.toHaveBeenCalled()
  })

  it('confirmation names document, company and effect', async () => {
    mount(DecisionForm, { props: { context, submit: vi.fn().mockResolvedValue(undefined) }, attachTo: body() })
    await choose('Setujui')
    button('Lanjutkan').click()
    await flushPromises()
    const dialog = body().querySelector('[role="alertdialog"]')!
    expect(dialog.textContent).toContain('Koreksi GRN-2611-0086')
    expect(dialog.textContent).toContain('PT Agung Abadi Putra Mandiri')
    expect(dialog.textContent).toContain('1.250,5 kg')
  })

  it('double confirm submits once; Esc cancels and restores focus', async () => {
    let resolve!: () => void
    const submit = vi.fn(() => new Promise<void>((r) => {
      resolve = r
    }))
    mount(DecisionForm, { props: { context, submit }, attachTo: body() })
    await choose('Setujui')
    button('Lanjutkan').click()
    await flushPromises()
    button('Konfirmasi').click()
    button('Konfirmasi')?.click()
    await nextTick()
    expect(submit).toHaveBeenCalledTimes(1)
    resolve()
    await flushPromises()

    document.body.innerHTML = ''
    const submit2 = vi.fn().mockResolvedValue(undefined)
    mount(DecisionForm, { props: { context, submit: submit2 }, attachTo: body() })
    await choose('Setujui')
    const trigger = button('Lanjutkan')
    trigger.focus()
    trigger.click()
    await flushPromises()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(body().querySelector('[role="alertdialog"]')).toBeNull()
    expect(submit2).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(button('Lanjutkan'))
  })

  it('rejected submit shows outcome unknown and retries the same payload', async () => {
    const submit = vi.fn().mockRejectedValueOnce(new Error('timeout')).mockResolvedValue(undefined)
    mount(DecisionForm, { props: { context, submit }, attachTo: body() })
    await choose('Setujui')
    button('Lanjutkan').click()
    await flushPromises()
    button('Konfirmasi').click()
    await flushPromises()
    expect(body().textContent).toContain('Hasil belum pasti')
    expect(button('Cek status')).toBeTruthy()
    button('Coba lagi').click()
    await flushPromises()
    expect(submit).toHaveBeenCalledTimes(2)
    expect(submit.mock.calls[1]).toEqual(submit.mock.calls[0])
    expect(body().textContent).toContain('Keputusan tersimpan')
  })

  // Final review #3: after an unknown outcome "Lanjutkan" stayed live, hid the warning and let the
  // user send a blind duplicate; after saving it did the same.
  it('after an unknown outcome only Cek status or Coba lagi can act, on the same choice', async () => {
    const submit = vi.fn().mockRejectedValue(new Error('timeout'))
    mount(DecisionForm, { props: { context, submit }, attachTo: body() })
    await choose('Setujui')
    button('Lanjutkan').click()
    await flushPromises()
    button('Konfirmasi').click()
    await flushPromises()
    // A disabled ReasonedAction's text also holds its sr-only reason, so match the label prefix.
    const next = [...body().querySelectorAll('button')].find(b => b.textContent?.trim().startsWith('Lanjutkan')) as HTMLButtonElement
    expect(next.getAttribute('aria-disabled')).toBe('true')
    expect(document.getElementById(next.getAttribute('aria-describedby')!)?.textContent).toContain('Cek status dulu')
    next.click()
    await flushPromises()
    expect(body().querySelector('[role="alertdialog"]')).toBeNull()
    expect(body().textContent).toContain('Hasil belum pasti')
    expect([...body().querySelectorAll('[role="radio"]')].every(r => r.hasAttribute('data-disabled'))).toBe(true)
    expect((body().querySelector('textarea') as HTMLTextAreaElement).disabled).toBe(true)
    expect(submit).toHaveBeenCalledTimes(1)
  })

  it('a saved decision cannot be sent again', async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    mount(DecisionForm, { props: { context, submit }, attachTo: body() })
    await choose('Setujui')
    button('Lanjutkan').click()
    await flushPromises()
    button('Konfirmasi').click()
    await flushPromises()
    expect(button('Lanjutkan').getAttribute('data-availability')).toBe('done')
    button('Lanjutkan').click()
    await flushPromises()
    expect(body().querySelector('[role="alertdialog"]')).toBeNull()
    expect(submit).toHaveBeenCalledTimes(1)
  })
})
