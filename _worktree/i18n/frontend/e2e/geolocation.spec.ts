import { test, expect } from './support/mock'
import { searchAndPick } from './support/actions'
import { setLocale } from './support/locale'

// #3 Geolocalização (US6): conceder permissão carrega o clima local.
test.describe('Geolocation granted', () => {
  test.use({ geolocation: { latitude: 51.5, longitude: -0.12 }, permissions: ['geolocation'] })

  test('#3 loads local weather when permission is granted', async ({ page }) => {
    // Arrange
    await page.goto('/')

    // Act
    await page.getByRole('button', { name: 'Usar minha localização' }).click()

    // Assert — weather for the current location renders (US6)
    const hero = page.getByRole('region', { name: /Clima atual/i })
    await expect(hero).toBeVisible()
    await expect(hero.getByText('Localização atual')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Próximas 24 horas' })).toBeVisible()
  })

  test('#3 loads local weather in English when EN is active', async ({ page }) => {
    // Arrange
    await setLocale(page, 'en')
    await page.goto('/')

    // Act
    await page.getByRole('button', { name: 'Use my location' }).click()

    // Assert — weather for the current location renders in EN (US6)
    const hero = page.getByRole('region', { name: /Current weather/i })
    await expect(hero).toBeVisible()
    await expect(hero.getByText('Current location')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Next 24 hours' })).toBeVisible()
  })
})

// #4 Permissão negada (US8): negar geolocalização mantém a busca manual operante.
test.describe('Geolocation denied', () => {
  test('#4 keeps manual search working when permission is denied', async ({ page }) => {
    // Arrange — no geolocation permission granted in this context
    await page.goto('/')

    // Act
    await page.getByRole('button', { name: 'Usar minha localização' }).click()

    // Assert — clear notice and manual search still operational (US8)
    await expect(page.getByText(/Permissão de localização negada/)).toBeVisible()
    await searchAndPick(page, 'São Paulo')
    await expect(page.getByRole('region', { name: /Clima atual/i })).toBeVisible()
  })

  test('#4 keeps manual search working in English when permission is denied', async ({ page }) => {
    // Arrange — no geolocation permission granted in this context
    await setLocale(page, 'en')
    await page.goto('/')

    // Act
    await page.getByRole('button', { name: 'Use my location' }).click()

    // Assert — clear notice and manual search still operational (US8)
    await expect(page.getByText(/Location permission denied/)).toBeVisible()
    await searchAndPick(page, 'São Paulo', 'en')
    await expect(page.getByRole('region', { name: /Current weather/i })).toBeVisible()
  })
})
