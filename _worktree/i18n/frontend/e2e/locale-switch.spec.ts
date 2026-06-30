import { test, expect } from './support/mock'
import { searchAndPick } from './support/actions'

test.describe('Locale switch and persistence', () => {
  test('switches to English instantly, persists after reload and keeps html lang in sync', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await expect(page.getByRole('button', { name: 'Português (Brasil)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByRole('combobox', { name: 'Buscar cidade' })).toBeVisible()

    const navigationCountBefore = await page.evaluate(
      () => performance.getEntriesByType('navigation').length,
    )
    const switchStartedAt = Date.now()
    await page.getByRole('button', { name: 'English' }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByRole('combobox', { name: 'Search city' })).toBeVisible()
    await expect(page.getByRole('status', { name: 'Loading weather' })).toHaveCount(0)
    expect(Date.now() - switchStartedAt).toBeLessThan(100)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('wx-locale'))).toBe('en')
    await expect.poll(() => page.evaluate(() => location.pathname + location.search + location.hash)).toBe('/')
    await expect
      .poll(() => page.evaluate(() => performance.getEntriesByType('navigation').length))
      .toBe(navigationCountBefore)

    await searchAndPick(page, 'São Paulo', 'en')
    const hero = page.getByRole('region', { name: /Current weather/i })
    await expect(hero.getByText('Partly cloudy')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Next 24 hours' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '7-day forecast' })).toBeVisible()

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await page.reload()
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect(page.getByRole('combobox', { name: 'Search city' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'English' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    }

    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await expect(page.getByRole('combobox', { name: 'Buscar cidade' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Português (Brasil)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('supports keyboard locale switching with Enter and Space', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'English' }).focus()
    await expect(page.getByRole('button', { name: 'English' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await page.getByRole('button', { name: 'Português (Brasil)' }).focus()
    await expect(page.getByRole('button', { name: 'Português (Brasil)' })).toBeFocused()
    await page.keyboard.press('Space')
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await expect(page.getByRole('button', { name: 'Português (Brasil)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('renders English without visible Portuguese UI fragments', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'English' }).click()
    await searchAndPick(page, 'São Paulo', 'en')

    const visibleText = await page.locator('body').innerText()
    for (const fragment of [
      'Buscar cidade',
      'Clima atual',
      'Parcialmente nublado',
      'Próximas 24 horas',
      'Previsão de 7 dias',
      'Condições detalhadas',
      'Nascer do sol',
      'Qualidade do ar',
      'Razoável',
      'Tentar de novo',
    ]) {
      expect(visibleText).not.toContain(fragment)
    }
  })
})
