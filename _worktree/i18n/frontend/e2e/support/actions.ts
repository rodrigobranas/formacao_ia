import type { Page } from '@playwright/test'
import type { E2ELocale } from './locale'

const SEARCH_LABEL_BY_LOCALE: Record<E2ELocale, string> = {
  'pt-BR': 'Buscar cidade',
  en: 'Search city',
}

/** Types a term into the city search box (debounced autocomplete kicks in). */
export async function searchCity(
  page: Page,
  term: string,
  locale: E2ELocale = 'pt-BR',
): Promise<void> {
  await page.getByRole('combobox', { name: SEARCH_LABEL_BY_LOCALE[locale] }).fill(term)
}

/** Searches for a term and clicks the first matching suggestion. */
export async function searchAndPick(
  page: Page,
  term: string,
  locale: E2ELocale = 'pt-BR',
): Promise<void> {
  await searchCity(page, term, locale)
  await page.getByRole('option', { name: new RegExp(term, 'i') }).first().click()
}
