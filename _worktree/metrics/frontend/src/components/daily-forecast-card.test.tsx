import { beforeEach, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DailyForecastCard } from './daily-forecast-card'
import { UnitPreferenceWrapper } from '@/hooks/use-unit-preference'
import { buildPayload } from '@/test/fixtures'

function setStoredUnits(temp: 'c' | 'f') {
  localStorage.setItem('wx:units', JSON.stringify({ temp }))
}

function renderCard(days = buildPayload().daily) {
  return render(
    <UnitPreferenceWrapper>
      <DailyForecastCard days={days} />
    </UnitPreferenceWrapper>,
  )
}

describe('DailyForecastCard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('#48 renders 7 rows with min, max and a condition per day', () => {
    // Arrange
    setStoredUnits('c')
    const { daily } = buildPayload()

    // Act
    const { container } = renderCard(daily)

    // Assert — RF12/RF13
    expect(container.querySelectorAll('.wx-drow')).toHaveLength(7)
    expect(screen.getByText('Hoje')).toBeInTheDocument()
    const firstRow = container.querySelector('.wx-drow')
    expect(firstRow?.querySelector('.lo')?.textContent).toBe('12°')
    expect(firstRow?.querySelector('.hi')?.textContent).toBe('22°')
    // condition is conveyed by an icon carrying an accessible label
    expect(firstRow?.querySelector('svg[aria-label]')).not.toBeNull()
  })

  it('shows imperial min/max labels and computes range bar styles from converted values', () => {
    // Arrange
    const { daily } = buildPayload()
    setStoredUnits('c')
    const metric = renderCard(daily)
    const metricFillStyle = metric.container.querySelector('.wx-drow .fill')?.getAttribute('style')
    metric.unmount()
    setStoredUnits('f')

    // Act
    const { container } = renderCard(daily)

    // Assert
    const firstRow = container.querySelector('.wx-drow')
    expect(firstRow?.querySelector('.lo')?.textContent).toBe('54°')
    expect(firstRow?.querySelector('.hi')?.textContent).toBe('72°')
    expect(firstRow?.querySelector('.fill')?.getAttribute('style')).not.toBe(metricFillStyle)
    expect(screen.getAllByText('30%')).toHaveLength(4)
  })
})
