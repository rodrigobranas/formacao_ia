import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { WeatherHero } from './weather-hero'
import { buildCurrent, LONDON } from '@/test/fixtures'
import { renderWithI18n } from '@/i18n/test-utils'

const TODAY = {
  date: '2026-06-25',
  weather_code: 2,
  temp_min: 14,
  temp_max: 24,
  precipitation_probability_max: 30,
  sunrise: '2026-06-25T05:45',
  sunset: '2026-06-25T20:30',
  uv_index_max: 6,
}

describe('WeatherHero', () => {
  it('#43 renders temperature, PT-BR condition, hi/lo, quick stats and city name', () => {
    // Arrange
    const current = buildCurrent()

    // Act
    const { container } = renderWithI18n(
      <WeatherHero location={LONDON} current={current} today={TODAY} windUnit="km/h" onRefresh={vi.fn()} />,
    )

    // Assert — RF5–RF8
    expect(container.querySelector('.wx-temp')?.textContent).toBe('21°')
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument()
    expect(screen.getByText('24°')).toBeInTheDocument()
    expect(screen.getByText('14°')).toBeInTheDocument()
    expect(screen.getByText('London')).toBeInTheDocument()
    expect(screen.getByText('Sensação')).toBeInTheDocument()
    expect(screen.getByText('12 km/h NO')).toBeInTheDocument()
    expect(screen.getByText('58%')).toBeInTheDocument()
  })

  it('#43 marks the hero container as an aria-live polite region', () => {
    // Arrange / Act
    const { container } = renderWithI18n(
      <WeatherHero location={LONDON} current={buildCurrent()} today={TODAY} windUnit="km/h" onRefresh={vi.fn()} />,
    )

    // Assert
    const hero = container.querySelector('.wx-hero')
    expect(hero).toHaveAttribute('aria-live', 'polite')
  })

  it('renders API condition labels in English', () => {
    renderWithI18n(
      <WeatherHero location={LONDON} current={buildCurrent()} today={TODAY} windUnit="km/h" onRefresh={vi.fn()} />,
      { locale: 'en' },
    )

    expect(screen.getByText('Partly cloudy')).toBeInTheDocument()
    expect(screen.getByText('Feels like')).toBeInTheDocument()
  })

  it('renders the current-location API label in English', () => {
    renderWithI18n(
      <WeatherHero
        location={{ ...LONDON, name: 'Localização atual' }}
        current={buildCurrent()}
        today={TODAY}
        windUnit="km/h"
        onRefresh={vi.fn()}
      />,
      { locale: 'en' },
    )

    expect(screen.getByRole('region', { name: 'Current weather in Current location' })).toBeInTheDocument()
    expect(screen.getByText('Current location')).toBeInTheDocument()
  })
})
