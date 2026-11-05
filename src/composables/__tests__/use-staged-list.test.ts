// @vitest-environment happy-dom
import type { EffectScope } from 'vue'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, shallowRef } from 'vue'

import { useStagedList } from '../use-staged-list'

interface Item { id: string }

const a: Item = { id: 'a' }
const b: Item = { id: 'b' }
const c: Item = { id: 'c' }
const d: Item = { id: 'd' }

function ids(list: Item[]) {
  return list.map(item => item.id)
}

describe('useStagedList', () => {
  let scope: EffectScope

  beforeEach(() => {
    vi.useFakeTimers()
    scope = effectScope()
  })

  afterEach(() => {
    scope.stop()
    vi.useRealTimers()
  })

  function setup(initial: Item[]) {
    const source = shallowRef<Item[]>(initial)
    const staged = scope.run(() => useStagedList(source, item => item.id))!
    return { source, ...staged }
  }

  it('keeps removed rows during the exit phase', async () => {
    const { source, items, leaving } = setup([a, b, c])

    source.value = [a, c]
    await nextTick()

    expect(ids(items.value)).toEqual(['a', 'b', 'c'])
    expect([...leaving.value]).toEqual(['b'])
  })

  it('commits the new list after exitMs', async () => {
    const { source, items, leaving } = setup([a, b, c])

    source.value = [a, c]
    await nextTick()
    vi.advanceTimersByTime(160)

    expect(ids(items.value)).toEqual(['a', 'c'])
    expect(leaving.value.size).toBe(0)
  })

  it('adds new rows immediately without an exit phase', async () => {
    const { source, items, leaving } = setup([a])

    source.value = [a, b]
    await nextTick()

    expect(ids(items.value)).toEqual(['a', 'b'])
    expect(leaving.value.size).toBe(0)
  })

  it('rapid changes leave no ghosts', async () => {
    const { source, items, leaving } = setup([a, b, c])

    source.value = [a]
    await nextTick()
    vi.advanceTimersByTime(50)

    source.value = [a, d]
    await nextTick()
    vi.advanceTimersByTime(160)

    expect(ids(items.value)).toEqual(['a', 'd'])
    expect(leaving.value.size).toBe(0)

    // Nothing pending may resurrect an old row later on.
    vi.advanceTimersByTime(1000)
    expect(ids(items.value)).toEqual(['a', 'd'])
  })
})
