import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { HourlyForecastCard } from './hourly-forecast-card'
import { buildPayload } from '@/test/fixtures'
import { renderWithI18n } from '@/i18n/test-utils'

describe('HourlyForecastCard', () => {
  it('#47 renders 24 columns with a textual temperature label per hour', () => {
    // Arrange
    const { hourly } = buildPayload()

    // Act
    const { container } = renderWithI18n(<HourlyForecastCard hours={hourly} />)

    // Assert — RF9–RF11
    expect(container.querySelectorAll('.wx-hgc')).toHaveLength(24)
    expect(container.querySelectorAll('.wx-hg-temp')).toHaveLength(24)
    expect(screen.getByText('Agora')).toBeInTheDocument()
    expect(container.querySelector('.wx-hg-temp')?.textContent).toBe('18°')
  })

  it('renders the current hour label in English', () => {
    const { hourly } = buildPayload()

    renderWithI18n(<HourlyForecastCard hours={hourly} />, { locale: 'en' })

    expect(screen.getByText('Now')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Next 24 hours' })).toBeInTheDocument()
  })
})
