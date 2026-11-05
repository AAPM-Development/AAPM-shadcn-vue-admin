import { useStorage } from '@vueuse/core'

/** System languages, in switcher order: Bahasa Indonesia (default), then English. */
export type Language = 'id' | 'en'

export const SUPPORTED_LOCALES = new Set<Language>([
  'id',
  'en',
])

export const DEFAULT_LOCALE: Language = 'id'

/** BCP 47 tags for `<html lang>` and Intl formatting. */
export const LOCALE_TAGS: Record<Language, string> = {
  id: 'id-ID',
  en: 'en-US',
}

export const appLocale = useStorage<Language>('app-locale', DEFAULT_LOCALE)

/** A stored locale this build no longer ships (e.g. 'zh') falls back to Indonesian. */
export function validateAppLocale() {
  if (!SUPPORTED_LOCALES.has(appLocale.value)) {
    appLocale.value = DEFAULT_LOCALE
  }
}
