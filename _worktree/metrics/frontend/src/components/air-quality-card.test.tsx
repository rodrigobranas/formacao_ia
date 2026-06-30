import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AirQualityCard } from './air-quality-card'
import { buildAirQuality } from '@/test/fixtures'

describe('AirQualityCard', () => {
  it('#51 shows EAQI value, qualitative label and pollutants', () => {
    // Arrange
    const air = buildAirQuality()

    // Act
    render(<AirQualityCard air={air} />)

    // Assert — RF14
    expect(screen.getByText('32')).toBeInTheDocument()
    expect(screen.getByText('Razoável')).toBeInTheDocument()
    expect(screen.getByText('PM2.5')).toBeInTheDocument()
    expect(screen.getByText('O₃')).toBeInTheDocument()
  })

  it('#52 shows an explicit empty state when air is null', () => {
    // Arrange / Act
    render(<AirQualityCard air={null} />)

    // Assert — RF17
    expect(
      screen.getByText('Dados de qualidade do ar indisponíveis para este local.'),
    ).toBeInTheDocument()
  })
})
