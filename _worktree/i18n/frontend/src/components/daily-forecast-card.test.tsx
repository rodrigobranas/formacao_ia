import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { DailyForecastCard } from './daily-forecast-card'
import { buildPayload } from '@/test/fixtures'
import { renderWithI18n } from '@/i18n/test-utils'

describe('DailyForecastCard', () => {
  it('#48 renders 7 rows with min, max and a condition per day', () => {
    // Arrange
    const { daily } = buildPayload()

    // Act
    const { container } = renderWithI18n(<DailyForecastCard days={daily} />)

    // Assert — RF12/RF13
    expect(container.querySelectorAll('.wx-drow')).toHaveLength(7)
    expect(screen.getByText('Hoje')).toBeInTheDocument()
    const firstRow = container.querySelector('.wx-drow')
    expect(firstRow?.querySelector('.lo')?.textContent).toBe('12°')
    expect(firstRow?.querySelector('.hi')?.textContent).toBe('22°')
    // condition is conveyed by an icon carrying an accessible label
    expect(firstRow?.querySelector('svg[aria-label]')).not.toBeNull()
  })

  it('renders daily labels in English', () => {
    const { daily } = buildPayload()

    renderWithI18n(<DailyForecastCard days={daily} />, { locale: 'en' })

    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: 'Cloudy' })).not.toHaveLength(0)
  })
})
