import { test, expect } from './support/mock'
import { searchCity } from './support/actions'

// #2 Autocomplete/desambiguação (US1): termo com homônimos lista variações com
// estado/país.
test.describe('City autocomplete disambiguation', () => {
  test('#2 lists homonyms with their state and country', async ({ page }) => {
    // Arrange
    await page.goto('/')

    // Act
    await searchCity(page, 'São Paulo')

    // Assert — listbox shows the same name disambiguated by region (RF1/RF2)
    const listbox = page.getByRole('listbox', { name: /Sugestões/i })
    await expect(listbox.getByRole('option')).toHaveCount(3)
    await expect(listbox.getByText('São Paulo, Brasil')).toBeVisible()
    await expect(listbox.getByText('Pernambuco, Brasil')).toBeVisible()
    await expect(listbox.getByText('Amazonas, Brasil')).toBeVisible()
  })
})
