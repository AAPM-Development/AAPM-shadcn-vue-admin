import type { App } from 'vue'

import { watch } from 'vue'
import { createI18n } from 'vue-i18n'

import type { Language } from '.'

import { appLocale, DEFAULT_LOCALE, LOCALE_TAGS, validateAppLocale } from '.'
import en from './en.json'
import id from './id.json'

export function setupI18n(app: App) {
  validateAppLocale()

  const i18n = createI18n({
    legacy: false,
    locale: appLocale.value,
    fallbackLocale: DEFAULT_LOCALE,
    messages: <Record<Language, Record<string, any>>>{
      id,
      en,
    },
  })
  app.use(i18n)

  // Keep <html lang> in step so screen readers, hyphenation and Intl defaults follow the language.
  watch(appLocale, (lang) => {
    if (typeof document !== 'undefined')
      document.documentElement.lang = LOCALE_TAGS[lang] ?? LOCALE_TAGS[DEFAULT_LOCALE]
  }, { immediate: true })
}
