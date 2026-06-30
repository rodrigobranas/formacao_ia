import { test, expect, setMock } from './support/mock'
import { searchCity } from './support/actions'
import { setLocale } from './support/locale'

// #5 Cidade não encontrada (US7): busca inválida exibe mensagem clara em PT-BR.
test.describe('City not found', () => {
  test('#5 shows a clear PT-BR message when no city matches', async ({ page, request }) => {
    // Arrange — geocoding returns no results
    await setMock(request, { geocoding: 'empty' })
    await page.goto('/')

    // Act
    await searchCity(page, 'zzzzzz')

    // Assert — empty state guidance (RF4/US7)
    await expect(page.getByText('Nenhuma cidade encontrada')).toBeVisible()
  })

  test('#5 shows a clear EN message when no city matches', async ({ page, request }) => {
    // Arrange — geocoding returns no results
    await setMock(request, { geocoding: 'empty' })
    await setLocale(page, 'en')
    await page.goto('/')

    // Act
    await searchCity(page, 'zzzzzz', 'en')

    // Assert — empty state guidance in active locale (RF4/US7)
    await expect(page.getByText('No cities found')).toBeVisible()
  })
})
