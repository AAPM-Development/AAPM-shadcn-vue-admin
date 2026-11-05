import { storeToRefs } from 'pinia'
import { watch } from 'vue'

import { DEFAULT_THEME, THEMES } from '@/constants/themes'
import { useThemeStore } from '@/stores/theme'

export function useSystemTheme() {
  const themeStore = useThemeStore()
  const { setTheme, setRadius } = themeStore
  const { theme, radius } = storeToRefs(themeStore)

  if (typeof document !== 'undefined') {
    watch(theme, (value) => {
      // A persisted value from an older build may no longer exist: fall back to AAPM.
      const resolved = THEMES.includes(value) ? value : DEFAULT_THEME
      if (resolved !== value)
        setTheme(resolved)
      document.documentElement.classList.remove(...THEMES.map(t => `theme-${t}`), `theme-${value}`)
      document.documentElement.classList.add(`theme-${resolved}`)
    }, { immediate: true })

    watch(radius, (radius) => {
      document.documentElement.style.setProperty('--radius', `${radius}rem`)
    }, { immediate: true })
  }

  return {
    theme,
    radius,
    setTheme,
    setRadius,
  }
}
