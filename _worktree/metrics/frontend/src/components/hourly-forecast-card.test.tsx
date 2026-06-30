import { beforeEach, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HourlyForecastCard } from './hourly-forecast-card'
import { UnitPreferenceWrapper } from '@/hooks/use-unit-preference'
import { buildPayload } from '@/test/fixtures'

function setStoredUnits(temp: 'c' | 'f') {
  localStorage.setItem('wx:units', JSON.stringify({ temp }))
}

function renderCard(hours = buildPayload().hourly) {
  return render(
    <UnitPreferenceWrapper>
      <HourlyForecastCard hours={hours} />
    </UnitPreferenceWrapper>,
  )
}

describe('HourlyForecastCard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('#47 renders 24 columns with a textual temperature label per hour', () => {
    // Arrange
    setStoredUnits('c')
    const { hourly } = buildPayload()

    // Act
    const { container } = renderCard(hourly)

    // Assert — RF9–RF11
    expect(container.querySelectorAll('.wx-hgc')).toHaveLength(24)
    expect(container.querySelectorAll('.wx-hg-temp')).toHaveLength(24)
    expect(screen.getByText('Agora')).toBeInTheDocument()
    expect(container.querySelector('.wx-hg-temp')?.textContent).toBe('18°')
  })

  it('shows imperial hourly labels and uses converted temperatures for the SVG curve', () => {
    // Arrange
    const { hourly } = buildPayload()
    setStoredUnits('c')
    const metric = renderCard(hourly)
    const metricPath = metric.container.querySelector('.wx-hg-line path[stroke]')?.getAttribute('d')
    metric.unmount()
    setStoredUnits('f')

    // Act
    const { container } = renderCard(hourly)

    // Assert
    expect(container.querySelector('.wx-hg-temp')?.textContent).toBe('64°')
    expect(container.querySelector('.wx-hg-line path[stroke]')?.getAttribute('d')).not.toBe(metricPath)
    expect(screen.getAllByText('20%')).toHaveLength(8)
  })
})
