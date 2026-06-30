import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { AirQualityCard } from './air-quality-card'
import { buildAirQuality } from '@/test/fixtures'
import { renderWithI18n } from '@/i18n/test-utils'

describe('AirQualityCard', () => {
  it('#51 shows EAQI value, qualitative label and pollutants', () => {
    // Arrange
    const air = buildAirQuality()

    // Act
    renderWithI18n(<AirQualityCard air={air} />)

    // Assert — RF14
    expect(screen.getByText('32')).toBeInTheDocument()
    expect(screen.getByText('Razoável')).toBeInTheDocument()
    expect(screen.getByText('PM2.5')).toBeInTheDocument()
    expect(screen.getByText('O₃')).toBeInTheDocument()
  })

  it('#52 shows an explicit empty state when air is null', () => {
    // Arrange / Act
    renderWithI18n(<AirQualityCard air={null} />)

    // Assert — RF17
    expect(
      screen.getByText('Dados de qualidade do ar indisponíveis para este local.'),
    ).toBeInTheDocument()
  })

  it('renders API air quality labels in English', () => {
    renderWithI18n(
      <AirQualityCard air={buildAirQuality({ category: { label: 'Boa', description: 'Qualidade do ar excelente, sem riscos à saúde.' } })} />,
      { locale: 'en' },
    )

    expect(screen.getByText('Good')).toBeInTheDocument()
    expect(screen.getByText('Air quality is excellent, with no health risks.')).toBeInTheDocument()
  })
})
