import { beforeEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeatherHero } from './weather-hero'
import { UnitPreferenceWrapper } from '@/hooks/use-unit-preference'
import { buildCurrent, LONDON } from '@/test/fixtures'

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

function setStoredUnits(temp: 'c' | 'f') {
  localStorage.setItem('wx:units', JSON.stringify({ temp }))
}

function renderHero(current = buildCurrent(), today = TODAY) {
  return render(
    <UnitPreferenceWrapper>
      <WeatherHero location={LONDON} current={current} today={today} onRefresh={vi.fn()} />
    </UnitPreferenceWrapper>,
  )
}

describe('WeatherHero', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('#43 renders temperature, PT-BR condition, hi/lo, quick stats and city name', () => {
    // Arrange
    setStoredUnits('c')
    const current = buildCurrent()

    // Act
    const { container } = renderHero(current)

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
    const { container } = renderHero()

    // Assert
    const hero = container.querySelector('.wx-hero')
    expect(hero).toHaveAttribute('aria-live', 'polite')
  })

  it('shows imperial hero temperatures and quick-stat wind when °F is active', () => {
    // Arrange
    setStoredUnits('f')

    // Act
    const { container } = renderHero()

    // Assert
    expect(container.querySelector('.wx-temp')?.textContent).toBe('70°')
    expect(screen.getByText('75°')).toBeInTheDocument()
    expect(screen.getByText('57°')).toBeInTheDocument()
    expect(screen.getByText('68°')).toBeInTheDocument()
    expect(screen.getByText('7 mph NO')).toBeInTheDocument()
    expect(screen.getByText('58%')).toBeInTheDocument()
  })
})
