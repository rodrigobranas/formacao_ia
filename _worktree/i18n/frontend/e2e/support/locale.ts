import type { Page } from '@playwright/test'

export type E2ELocale = 'pt-BR' | 'en'

const LOCALE_STORAGE_KEY = 'wx-locale'

/** Persists the app locale before navigation so i18n initializes in that language. */
export async function setLocale(page: Page, locale: E2ELocale): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value)
    },
    { key: LOCALE_STORAGE_KEY, value: locale },
  )
}
