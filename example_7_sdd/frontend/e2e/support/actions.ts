import type { Page } from '@playwright/test'

/** Types a term into the city search box (debounced autocomplete kicks in). */
export async function searchCity(page: Page, term: string): Promise<void> {
  await page.getByRole('combobox', { name: 'Buscar cidade' }).fill(term)
}

/** Searches for a term and clicks the first matching suggestion. */
export async function searchAndPick(page: Page, term: string): Promise<void> {
  await searchCity(page, term)
  await page.getByRole('option', { name: new RegExp(term, 'i') }).first().click()
}
