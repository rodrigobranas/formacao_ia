import i18n, { type i18n as I18nInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import ptBR from './locales/pt-BR.json'
import en from './locales/en.json'

export type AppLocale = 'pt-BR' | 'en'

export const LOCALE_STORAGE_KEY = 'wx-locale'
export const DEFAULT_LOCALE: AppLocale = 'pt-BR'
export const SUPPORTED_LOCALES: AppLocale[] = ['pt-BR', 'en']

const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
} as const

let reactPluginRegistered = false
let languageListenerRegistered = false

export function isAppLocale(locale: string | null | undefined): locale is AppLocale {
  return SUPPORTED_LOCALES.includes(locale as AppLocale)
}

function readStoredLocale(): AppLocale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isAppLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

function persistLocale(locale: AppLocale): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Storage can be unavailable in private browsing or locked-down test contexts.
  }
}

export function syncDocumentLang(locale: AppLocale): void {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.lang = locale
}

function normalizeLocale(locale: string | undefined): AppLocale {
  return isAppLocale(locale) ? locale : DEFAULT_LOCALE
}

export function initI18n(): I18nInstance {
  const initialLocale = readStoredLocale()

  if (!reactPluginRegistered) {
    i18n.use(initReactI18next)
    reactPluginRegistered = true
  }

  if (!languageListenerRegistered) {
    i18n.on('languageChanged', (locale) => {
      const appLocale = normalizeLocale(locale)
      persistLocale(appLocale)
      syncDocumentLang(appLocale)
    })
    languageListenerRegistered = true
  }

  if (!i18n.isInitialized) {
    void i18n.init({
      resources,
      lng: initialLocale,
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: SUPPORTED_LOCALES,
      interpolation: { escapeValue: false },
      initAsync: false,
      returnNull: false,
    })
  } else if (normalizeLocale(i18n.language) !== initialLocale) {
    void i18n.changeLanguage(initialLocale)
  } else {
    syncDocumentLang(initialLocale)
  }

  syncDocumentLang(initialLocale)

  return i18n
}

export { resources }
