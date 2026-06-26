import { test, expect, setMock } from './support/mock'
import { searchAndPick } from './support/actions'

// #8 Estados de carregamento (RF23/US10): skeletons visíveis durante atraso
// simulado da resposta.
test.describe('Loading states', () => {
  test('#8 shows skeletons while the weather response is delayed', async ({ page, request }) => {
    // Arrange — slow upstream so the loading state is observable
    await setMock(request, { delayMs: 1500 })
    await page.goto('/')

    // Act
    await searchAndPick(page, 'São Paulo')

    // Assert — skeletons appear during the load (RF23)...
    await expect(page.getByRole('status', { name: 'Carregando clima' })).toBeVisible()

    // ...and resolve into real content once data arrives
    await expect(page.getByRole('heading', { name: 'Próximas 24 horas' })).toBeVisible()
    await expect(page.getByRole('status', { name: 'Carregando clima' })).toBeHidden()
  })
})
