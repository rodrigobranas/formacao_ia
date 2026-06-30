import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { DetailedMetricsCard } from './detailed-metrics-card'
import { buildCurrent } from '@/test/fixtures'
import { renderWithI18n } from '@/i18n/test-utils'

describe('DetailedMetricsCard', () => {
  it('#49 shows UV with a qualitative label and the other metrics', () => {
    // Arrange
    const current = buildCurrent()

    // Act
    renderWithI18n(<DetailedMetricsCard current={current} uv={{ value: 6, label: 'Alto' }} windUnit="km/h" />)

    // Assert — RF7/RF15
    expect(screen.getByText('Índice UV')).toBeInTheDocument()
    expect(screen.getByText('Alto')).toBeInTheDocument()
    expect(screen.getByText('Sensação')).toBeInTheDocument()
    expect(screen.getByText('Umidade')).toBeInTheDocument()
    expect(screen.getByText('Pressão')).toBeInTheDocument()
  })

  it('#49 falls back to a placeholder when UV is unavailable', () => {
    // Arrange / Act
    renderWithI18n(<DetailedMetricsCard current={buildCurrent()} uv={null} windUnit="km/h" />)

    // Assert
    expect(screen.getByText('Índice UV')).toBeInTheDocument()
  })

  it('renders UV and wind cardinal labels in English', () => {
    renderWithI18n(<DetailedMetricsCard current={buildCurrent({ wind_direction: 90 })} uv={{ value: 6, label: 'Alto' }} windUnit="km/h" />, { locale: 'en' })

    expect(screen.getByText('UV index')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
  })
})
