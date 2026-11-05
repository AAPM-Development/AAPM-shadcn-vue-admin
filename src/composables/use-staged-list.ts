import type { ComputedRef, Ref } from 'vue'

import { getCurrentScope, onScopeDispose, shallowRef, watch } from 'vue'

import { prefersReducedMotion } from '@/components/aapm/motion/easing'

export interface StagedListOptions {
  /** How long removed items stay rendered (and listed in `leaving`) before the list commits. */
  exitMs?: number
}

export interface StagedList<T> {
  /** What to render: the committed list, plus leaving items while an exit phase runs. */
  items: Ref<T[]>
  /** Keys of the items that are still rendered but already gone from `source`. */
  leaving: Ref<Set<string>>
}

/**
 * Stages list changes so removals can animate in place before the layout changes.
 *
 * 1. Items missing from the new `source` stay in `items` and are listed in `leaving`
 *    (CSS fades and compresses them, e.g. `tr[data-leaving="true"]`).
 * 2. After `exitMs`, `items` becomes the latest `source`, so the survivors FLIP to their new
 *    slots (TransitionGroup) and new items enter.
 *
 * A change without removals (only additions or a new order) commits at once. A change during
 * a pending exit re-stages against what is rendered, and the commit always reads the latest
 * `source`, so a rapid series of changes can never leave ghost items behind.
 */
export function useStagedList<T>(
  source: Ref<T[]> | ComputedRef<T[]>,
  key: (item: T) => string,
  opts: StagedListOptions = {},
): StagedList<T> {
  const exitMs = opts.exitMs ?? 160
  const items = shallowRef<T[]>([...source.value])
  const leaving = shallowRef<Set<string>>(new Set())
  let timer: ReturnType<typeof setTimeout> | undefined

  function cancel() {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  function commit(next: T[]) {
    cancel()
    items.value = next
    if (leaving.value.size)
      leaving.value = new Set()
  }

  // The spread tracks in-place mutations of a reactive array as well as reassignments.
  watch(() => [...source.value], (next) => {
    const nextByKey = new Map(next.map(item => [key(item), item] as const))
    const gone = new Set<string>()
    for (const item of items.value) {
      const k = key(item)
      if (!nextByKey.has(k))
        gone.add(k)
    }

    if (!gone.size || exitMs <= 0 || prefersReducedMotion()) {
      commit(next)
      return
    }

    // Exit phase: keep the rendered order, refresh the survivors, hold new items back.
    const grew = [...gone].some(k => !leaving.value.has(k))
    items.value = items.value.map(item => nextByKey.get(key(item)) ?? item)
    leaving.value = gone

    // Newly leaving items get their full exit time; items that only came back keep the deadline.
    if (grew || timer === undefined) {
      cancel()
      timer = setTimeout(() => commit([...source.value]), exitMs)
    }
  })

  if (getCurrentScope())
    onScopeDispose(cancel)

  return { items, leaving }
}
