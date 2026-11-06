// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import KitCorrectionFlow from '../kit-correction-flow.vue'

const stubs = { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } }
const body = () => document.body
const button = (text: string) => [...body().querySelectorAll('button')].find(b => b.textContent?.trim().startsWith(text)) as HTMLButtonElement
const docState = () => body().querySelector('[data-flow-state] [data-semantic-state]')?.getAttribute('data-semantic-state')
const activityCount = () => body().querySelectorAll('[data-flow-activity] li[data-activity]').length

describe('alur koreksi penerimaan barang', () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('walks readiness → correction → approval to a corrected document', async () => {
    vi.useFakeTimers()
    const w = mount(KitCorrectionFlow, { global: { stubs }, attachTo: body() })
    expect(docState()).toBe('work.completed')
    const before = activityCount()

    const open = () => button('Buka koreksi')
    expect(open().getAttribute('aria-disabled')).toBe('true')
    expect(document.getElementById(open().getAttribute('aria-describedby')!)?.textContent).toContain('Faktur pembelian PI-2611-031 sudah memakai baris 2')

    button('Batalkan tautan faktur').click()
    await nextTick()
    expect(open().getAttribute('aria-disabled')).toBeNull()
    open().click()
    await nextTick()

    await w.get('input[name="qty"]').setValue('1.250,5')
    await w.get('[data-flow-correction] textarea').setValue('Timbang ulang di gudang pakan')
    button('Ajukan koreksi').click()
    await nextTick()
    expect(docState()).toBe('work.pending_review')

    const approve = [...body().querySelectorAll('[role="radio"]')].find(r => r.closest('label')?.textContent?.includes('Setujui')) as HTMLElement
    approve.click()
    await nextTick()
    button('Lanjutkan').click()
    await flushPromises()
    button('Konfirmasi').click()
    await vi.advanceTimersByTimeAsync(900)
    await flushPromises()
    expect(docState()).toBe('history.corrected')

    expect(activityCount()).toBe(before + 3)
    const last = [...body().querySelectorAll('[data-flow-activity] li[data-activity]')].at(-1)!
    expect(last.querySelector('del')?.textContent).toBe('1.200 kg')
    expect(last.querySelector('ins')?.textContent).toBe('1.250,5 kg')

    button('Mulai ulang').click()
    await nextTick()
    expect(docState()).toBe('work.completed')
    expect(activityCount()).toBe(before)
  })

  // Keyboard walkthrough (B2b T11): each stage swap unmounted the focused button and dropped focus
  // on <body>, so keyboard and screen-reader users lost their place (WCAG 2.4.3).
  it('focus follows the flow instead of falling to the page body', async () => {
    mount(KitCorrectionFlow, { global: { stubs }, attachTo: body() })
    const stage = () => body().querySelector('[data-flow-stage]') as HTMLElement

    button('Batalkan tautan faktur').focus()
    button('Batalkan tautan faktur').click()
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(stage())
    expect(stage().getAttribute('aria-label')).toBe('Langkah 1 dari 4: Kesiapan')

    button('Buka koreksi').click()
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(stage())
    expect(stage().getAttribute('aria-label')).toBe('Langkah 2 dari 4: Koreksi')
  })
})
