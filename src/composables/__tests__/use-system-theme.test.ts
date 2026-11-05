// @vitest-environment happy-dom
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { effectScope, nextTick } from 'vue'

import type { Theme } from '@/constants/themes'

import { useThemeStore } from '@/stores/theme'

import { useSystemTheme } from '../use-system-theme'

describe('useSystemTheme', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.className = ''
  })

  it('defaults to the AAPM theme and keeps the template 0.5rem radius', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('aapm')
    expect(store.radius).toBe(0.5)
  })

  it('falls back to aapm when the persisted theme is unknown', async () => {
    const store = useThemeStore()
    store.theme = 'zinc-legacy' as Theme

    const scope = effectScope()
    scope.run(() => useSystemTheme())
    await nextTick()

    expect(document.documentElement.classList.contains('theme-aapm')).toBe(true)
    expect(document.documentElement.classList.contains('theme-zinc-legacy')).toBe(false)
    expect(store.theme).toBe('aapm')
    scope.stop()
  })
})
