import { test, expect, setMock } from './support/mock'
import { searchAndPick } from './support/actions'

// #7 Métrica indisponível (RF17): mock com air ausente mostra o estado vazio do
// cartão de qualidade do ar (restante do payload intacto).
test.describe('Air quality unavailable', () => {
  test('#7 shows the empty state of the air quality card when air is null', async ({ page, request }) => {
    // Arrange — Air Quality upstream fails; backend degrades to extras.air = null
    await setMock(request, { air: 'null' })
    await page.goto('/')

    // Act
    await searchAndPick(page, 'São Paulo')

    // Assert — air quality empty state, rest of the panel intact (RF17)
    const air = page.getByRole('region', { name: 'Qualidade do ar' })
    await expect(air.getByText('Dados de qualidade do ar indisponíveis para este local.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Próximas 24 horas' })).toBeVisible()
  })
})
