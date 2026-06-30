import { test, expect } from './support/mock'
import { searchAndPick } from './support/actions'

// #1 Fluxo principal (US1–US5): buscar cidade → selecionar sugestão → ver clima
// atual, 24h, 7 dias, métricas, UV, arco solar e qualidade do ar.
test.describe('Main weather journey', () => {
  test('#1 searches a city, selects it and renders current, hourly, daily and extras', async ({ page }) => {
    // Arrange
    await page.goto('/')

    // Act
    await searchAndPick(page, 'São Paulo')

    // Assert — current weather hero (US3)
    const hero = page.getByRole('region', { name: /Clima atual/i })
    await expect(hero).toBeVisible()
    await expect(hero.getByText('São Paulo').first()).toBeVisible()
    await expect(hero.getByText('Parcialmente nublado')).toBeVisible()

    // Assert — 24h and 7-day forecasts (US4)
    await expect(page.getByRole('heading', { name: 'Próximas 24 horas' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Previsão de 7 dias' })).toBeVisible()

    // Assert — extra metrics: UV, sun arc and air quality (US5)
    const metrics = page.getByRole('region', { name: 'Condições detalhadas' })
    await expect(metrics.getByText('Alto')).toBeVisible()
    const sun = page.getByRole('region', { name: 'Sol' })
    await expect(sun.getByText('Nascer do sol')).toBeVisible()
    const air = page.getByRole('region', { name: 'Qualidade do ar' })
    await expect(air.getByText('Razoável')).toBeVisible()
  })
})
