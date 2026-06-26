import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HourlyForecastCard } from './hourly-forecast-card'
import { buildPayload } from '@/test/fixtures'

describe('HourlyForecastCard', () => {
  it('#47 renders 24 columns with a textual temperature label per hour', () => {
    // Arrange
    const { hourly } = buildPayload()

    // Act
    const { container } = render(<HourlyForecastCard hours={hourly} />)

    // Assert — RF9–RF11
    expect(container.querySelectorAll('.wx-hgc')).toHaveLength(24)
    expect(container.querySelectorAll('.wx-hg-temp')).toHaveLength(24)
    expect(screen.getByText('Agora')).toBeInTheDocument()
    expect(container.querySelector('.wx-hg-temp')?.textContent).toBe('18°')
  })
})
