import { test, expect } from './support/mock'
import { searchAndPick } from './support/actions'
import { setLocale } from './support/locale'

// Regression for BUG-01: the "Próximas 24 horas" card rendered a 24-column band
// (~1404px) whose intrinsic width pushed the document width, producing a global
// horizontal scrollbar on desktop AND mobile. Root cause: the card (a grid item)
// kept its default `min-width: auto`, refusing to shrink below the band width and
// nullifying `.wx-hourly-scroll { overflow-x: auto }`. The fix adds `min-width: 0`
// to `.wx-card`. This test fails if the fix is reverted.
test.describe('Responsive layout — no horizontal overflow', () => {
  for (const width of [375, 1280]) {
    test(`#10 page does not scroll horizontally at ${width}px`, async ({ page }) => {
      // Arrange
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')

      // Act
      await searchAndPick(page, 'São Paulo')
      await expect(page.getByRole('heading', { name: 'Próximas 24 horas' })).toBeVisible()

      // Assert — the document never grows wider than its viewport (no global scroll)
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth)

      // Assert — the 24h band scrolls INSIDE the card, not the page
      const innerScrollable = await page.evaluate(() => {
        const el = document.querySelector('.wx-hourly-scroll')
        return el ? el.scrollWidth > el.clientWidth : false
      })
      expect(innerScrollable).toBe(true)
    })
  }

  for (const width of [375, 1280]) {
    test(`#10 English headings do not truncate or force horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      // Arrange
      await page.setViewportSize({ width, height: 900 })
      await setLocale(page, 'en')
      await page.goto('/')

      // Act
      await searchAndPick(page, 'São Paulo', 'en')
      const headings = page.getByRole('heading', {
        name: /Next 24 hours|7-day forecast|Detailed conditions|Air quality/i,
      })
      await expect(headings).toHaveCount(4)

      // Assert — EN text expansion stays inside the viewport and its own boxes.
      const layout = await page.evaluate(() => {
        const headingEls = Array.from(document.querySelectorAll('h2'))
        return {
          page: {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          },
          headings: headingEls.map((heading) => ({
            text: heading.textContent?.trim() ?? '',
            scrollWidth: heading.scrollWidth,
            clientWidth: heading.clientWidth,
          })),
        }
      })
      expect(layout.page.scrollWidth).toBeLessThanOrEqual(layout.page.clientWidth)
      for (const heading of layout.headings) {
        expect(heading.scrollWidth, `${heading.text} should fit its heading box`).toBeLessThanOrEqual(
          heading.clientWidth,
        )
      }
    })
  }
})
