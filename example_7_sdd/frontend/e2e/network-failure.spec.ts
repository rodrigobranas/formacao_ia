import { test, expect, setMock } from './support/mock'
import { searchAndPick } from './support/actions'

// #6 Falha de rede/fonte (US9): mock de 502 exibe toast de erro; "Tentar de novo"
// recupera após o mock voltar a 200.
test.describe('Recoverable source failure', () => {
  test('#6 shows an error toast and recovers on retry', async ({ page, request }) => {
    // Arrange — forecast upstream is down
    await setMock(request, { forecast: '502' })
    await page.goto('/')

    // Act — selecting a city triggers the failing load
    await searchAndPick(page, 'São Paulo')

    // Assert — recoverable error toast (US9/RF25)
    const toast = page.getByRole('alert')
    await expect(toast).toContainText('Fonte de dados indisponível.')

    // Act — upstream recovers and the user retries
    await setMock(request, { forecast: 'day' })
    await toast.getByRole('button', { name: 'Tentar de novo' }).click()

    // Assert — content now renders
    await expect(page.getByRole('heading', { name: 'Próximas 24 horas' })).toBeVisible()
    await expect(page.getByRole('region', { name: /Clima atual/i })).toBeVisible()
  })
})
