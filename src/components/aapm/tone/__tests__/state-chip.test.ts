// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { stateMeta } from '@/design-system/states'

import FreshnessIndicator from '../freshness-indicator.vue'
import StateChip from '../state-chip.vue'

describe('stateChip', () => {
  it('renders label and icon for each family', () => {
    for (const state of ['data.error', 'freshness.stale', 'work.blocked', 'history.corrected'] as const) {
      const chip = mount(StateChip, { props: { state } })
      expect(chip.text()).toContain(stateMeta(state).label)
      expect(chip.attributes('data-tone')).toBe(stateMeta(state).tone)
      expect(chip.find('svg').exists()).toBe(true)
      expect(chip.attributes('data-semantic-state')).toBe(state)
    }
  })

  it('unknown state renders a neutral chip with the raw text', () => {
    const chip = mount(StateChip, { props: { state: 'work.nope' as never } })
    expect(chip.text()).toContain('work.nope')
    expect(chip.attributes('data-tone')).toBe('neutral')
  })

  it('an empty state still renders a labelled chip, never a bare dot', () => {
    for (const state of ['', null, undefined]) {
      const chip = mount(StateChip, { props: { state: state as never } })
      expect(chip.text()).toBe('Tidak diketahui')
      expect(chip.attributes('data-tone')).toBe('neutral')
    }
  })
})

describe('freshnessIndicator', () => {
  const now = new Date('2026-11-05T10:00:00+07:00')

  it('says the state and when the data was last updated', () => {
    const w = mount(FreshnessIndicator, { props: { state: 'stale', since: new Date(now.getTime() - 12 * 60_000), now } })
    expect(w.text()).toContain('Belum diperbarui')
    expect(w.text()).toContain('Terakhir diperbarui 12 menit yang lalu')
  })

  it('freshness shows retry only when sync failed', async () => {
    const failed = mount(FreshnessIndicator, { props: { state: 'sync_failed', since: new Date(now.getTime() - 60_000), now } })
    await failed.get('button').trigger('click')
    expect(failed.emitted('retry')).toHaveLength(1)
    expect(failed.get('button').text()).toBe('Coba lagi')
    expect(mount(FreshnessIndicator, { props: { state: 'current', now } }).find('button').exists()).toBe(false)
  })

  afterEach(() => vi.useRealTimers())

  it('keeps its relative time current while mounted', async () => {
    vi.useFakeTimers({ now: new Date('2026-11-05T10:00:00+07:00') })
    const w = mount(FreshnessIndicator, { props: { state: 'current', since: Date.now() } })
    expect(w.text()).toContain('Terakhir diperbarui baru saja')
    vi.advanceTimersByTime(2 * 60_000 + 1_000)
    await nextTick()
    expect(w.text()).toContain('Terakhir diperbarui 2 menit yang lalu')
    w.unmount()
  })

  it('omits the time when nobody knows when the data was updated', () => {
    const w = mount(FreshnessIndicator, { props: { state: 'stale', now } })
    expect(w.text()).toContain('Belum diperbarui')
    expect(w.text()).not.toMatch(/Terakhir diperbarui/)
  })

  it('unknown freshness state renders a neutral chip with the raw text', () => {
    const w = mount(FreshnessIndicator, { props: { state: 'paused' as never, now } })
    expect(w.text()).toContain('paused')
    expect(w.get('[data-slot="tone-chip"]').attributes('data-tone')).toBe('neutral')
  })

  it('announces only the state, and the retry says what it retries', () => {
    const w = mount(FreshnessIndicator, { props: { state: 'sync_failed', since: new Date(now.getTime() - 60_000), now } })
    const status = w.get('[role="status"]')
    expect(status.text()).toBe('Gagal sinkron')
    expect(status.find('button').exists()).toBe(false)
    const describedBy = w.get('button').attributes('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(w.get(`[id="${describedBy}"]`).text()).toBe('Gagal sinkron')
  })

  it('spins only while syncing', () => {
    expect(mount(FreshnessIndicator, { props: { state: 'syncing', now } }).find('svg[data-loading="true"]').exists()).toBe(true)
    expect(mount(FreshnessIndicator, { props: { state: 'offline', now } }).find('svg[data-loading="true"]').exists()).toBe(false)
  })
})
