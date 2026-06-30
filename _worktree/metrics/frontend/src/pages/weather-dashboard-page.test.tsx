import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, fireEvent, within } from '@testing-library/react'
import { WeatherDashboardPage } from './weather-dashboard-page'
import { searchCities, fetchWeather } from '@/services/weather-api'
import { fetchHealth } from '@/services/health-api'
import { WeatherApiError } from '@/types/weather-api-error'
import { buildCurrent, buildPayload, LONDON } from '@/test/fixtures'
import type { WeatherPayload } from '@/types/weather-payload'

vi.mock('@/services/weather-api', () => ({
  searchCities: vi.fn(),
  fetchWeather: vi.fn(),
}))
vi.mock('@/services/health-api', () => ({
  fetchHealth: vi.fn().mockResolvedValue(true),
}))

const searchCitiesMock = vi.mocked(searchCities)
const fetchWeatherMock = vi.mocked(fetchWeather)
const fetchHealthMock = vi.mocked(fetchHealth)

const PARIS = {
  name: 'Paris',
  admin1: 'Ile-de-France',
  country: 'France',
  country_code: 'FR',
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: 'Europe/Paris',
}

function payloadWithDetailedValues(overrides: Partial<WeatherPayload> = {}) {
  return buildPayload({
    current: buildCurrent({ pressure: 1013, precipitation: 1 }),
    ...overrides,
  })
}

function stubGeolocation(impl: Geolocation['getCurrentPosition']) {
  Object.defineProperty(global.navigator, 'geolocation', { value: { getCurrentPosition: impl }, configurable: true })
}

async function flush() {
  await act(async () => {
    vi.advanceTimersByTime(240)
    await Promise.resolve()
  })
}

async function searchAndPick(term: string) {
  fireEvent.change(screen.getByRole('combobox'), { target: { value: term } })
  await flush()
  fireEvent.mouseDown(screen.getByRole('option'))
  await act(async () => {
    await Promise.resolve()
  })
}

describe('WeatherDashboardPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    searchCitiesMock.mockReset()
    fetchWeatherMock.mockReset()
    fetchHealthMock.mockResolvedValue(true)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('#9 searches, selects a suggestion and renders the hero and cards', async () => {
    // Arrange
    searchCitiesMock.mockResolvedValue([LONDON])
    fetchWeatherMock.mockResolvedValue(buildPayload())
    render(<WeatherDashboardPage />)

    // Act
    await searchAndPick('London')

    // Assert — US1–US5
    expect(screen.getByRole('heading', { name: 'Próximas 24 horas' })).toBeInTheDocument()
    expect(screen.getByText('Previsão de 7 dias')).toBeInTheDocument()
    expect(fetchWeatherMock).toHaveBeenCalledWith(expect.objectContaining({ name: 'London' }))
    const hero = document.querySelector('.wx-hero') as HTMLElement
    expect(within(hero).getByText('London')).toBeInTheDocument()
  })

  it('#10 sets the active city from granted geolocation', async () => {
    // Arrange
    fetchWeatherMock.mockResolvedValue(buildPayload())
    stubGeolocation((onSuccess) =>
      (onSuccess as PositionCallback)({ coords: { latitude: 51.5, longitude: -0.12 } } as GeolocationPosition),
    )
    render(<WeatherDashboardPage />)

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Usar minha localização' }))
    await act(async () => {
      await Promise.resolve()
    })

    // Assert — US6
    expect(fetchWeatherMock).toHaveBeenCalledWith(expect.objectContaining({ latitude: 51.5, longitude: -0.12 }))
    const hero = document.querySelector('.wx-hero') as HTMLElement
    expect(within(hero).getByText('London')).toBeInTheDocument()
  })

  it('#11 shows correction guidance when no city matches', async () => {
    // Arrange
    searchCitiesMock.mockResolvedValue([])
    render(<WeatherDashboardPage />)

    // Act
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzzzzz' } })
    await flush()

    // Assert — US7
    expect(screen.getByText('Nenhuma cidade encontrada')).toBeInTheDocument()
  })

  it('#12 keeps manual search working when permission is denied', async () => {
    // Arrange
    stubGeolocation((_onSuccess, onError) =>
      (onError as PositionErrorCallback)({ code: 1 } as GeolocationPositionError),
    )
    render(<WeatherDashboardPage />)

    // Act
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Usar minha localização' }))
    })

    // Assert — US8
    expect(screen.getByText(/Permissão de localização negada/)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeEnabled()

    // Settle the async API-health poll to avoid act warnings
    await act(async () => {
      await Promise.resolve()
    })
  })

  it('#13 shows a retry toast on network error and reloads on retry', async () => {
    // Arrange
    searchCitiesMock.mockResolvedValue([LONDON])
    fetchWeatherMock.mockRejectedValueOnce(new WeatherApiError('network_error', 'Falha de rede.'))
    render(<WeatherDashboardPage />)

    // Act — select triggers the failing load
    await searchAndPick('London')

    // Assert — US9 toast with retry
    expect(screen.getByRole('alert')).toHaveTextContent('Falha de rede.')
    const retry = screen.getByRole('button', { name: 'Tentar de novo' })

    // Act — retry succeeds
    fetchWeatherMock.mockResolvedValueOnce(buildPayload())
    await act(async () => {
      fireEvent.click(retry)
      await Promise.resolve()
    })

    // Assert — content now renders
    expect(screen.getByText('Previsão de 7 dias')).toBeInTheDocument()
  })
})

describe('WeatherDashboardPage units toggle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    searchCitiesMock.mockReset()
    fetchWeatherMock.mockReset()
    fetchHealthMock.mockResolvedValue(true)
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  async function mountPage() {
    render(<WeatherDashboardPage />)
    // Settle the async API-health poll to avoid act warnings.
    await act(async () => {
      await Promise.resolve()
    })
  }

  function header() {
    return document.querySelector('.wx-topbar') as HTMLElement
  }

  function classOrder() {
    return Array.from(header().children).map((child) => child.className)
  }

  it('#62 renders the unit toggle in the header between search and actions', async () => {
    // Arrange / Act
    await mountPage()

    // Assert — F1 placement (ADR-004): search → units → actions
    const order = classOrder()
    expect(within(header()).getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument()
    expect(order.indexOf('wx-search')).toBeLessThan(order.indexOf('wx-units'))
    expect(order.indexOf('wx-units')).toBeLessThan(order.indexOf('wx-actions'))
  })

  it('#63 shows the toggle on first paint before any weather data loads', async () => {
    // Arrange / Act
    await mountPage()

    // Assert — toggle is not gated behind weather payload
    expect(screen.getByText(/Busque uma cidade/)).toBeInTheDocument()
    expect(within(header()).getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument()
  })

  it('#64 activates the °F segment after clicking it', async () => {
    // Arrange
    await mountPage()

    // Act
    fireEvent.click(screen.getByRole('button', { name: '°F' }))

    // Assert
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('#65 restores the °F segment from persisted preference on mount', async () => {
    // Arrange
    localStorage.setItem('wx:units', JSON.stringify({ temp: 'f' }))

    // Act
    await mountPage()

    // Assert — F3 persistence across reloads
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('#66 defaults to °C when no preference is stored', async () => {
    // Arrange — localStorage cleared in beforeEach

    // Act
    await mountPage()

    // Assert — Celsius default
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('toggles a loaded dashboard to imperial across hero, hourly, daily and detailed cards without loading or error UI', async () => {
    // Arrange
    searchCitiesMock.mockResolvedValue([LONDON])
    fetchWeatherMock.mockResolvedValue(payloadWithDetailedValues())
    await mountPage()
    await searchAndPick('London')

    // Act
    fireEvent.click(screen.getByRole('button', { name: '°F' }))

    // Assert — all F2 in-scope surfaces update in the same render
    const hero = document.querySelector('.wx-hero') as HTMLElement
    expect(hero.querySelector('.wx-temp')?.textContent).toBe('70°')
    expect(within(hero).getByText('72°')).toBeInTheDocument()
    expect(within(hero).getByText('54°')).toBeInTheDocument()
    expect(within(hero).getByText('7 mph NO')).toBeInTheDocument()
    expect(document.querySelector('.wx-hg-temp')?.textContent).toBe('64°')
    const firstDailyRow = document.querySelector('.wx-drow') as HTMLElement
    expect(firstDailyRow.querySelector('.lo')?.textContent).toBe('54°')
    expect(firstDailyRow.querySelector('.hi')?.textContent).toBe('72°')
    expect(screen.getByText('29.9 inHg')).toBeInTheDocument()
    expect(screen.getByText('0.04 in')).toBeInTheDocument()
    expect(screen.getByText('15 mph')).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Carregando clima' })).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(fetchWeatherMock).toHaveBeenCalledTimes(1)
  })

  it('keeps the active imperial unit when searching a new city', async () => {
    // Arrange
    searchCitiesMock.mockResolvedValueOnce([LONDON]).mockResolvedValueOnce([PARIS])
    fetchWeatherMock
      .mockResolvedValueOnce(payloadWithDetailedValues())
      .mockResolvedValueOnce(payloadWithDetailedValues({
        location: PARIS,
        current: buildCurrent({ temperature: 10.4, apparent_temperature: 9.5, wind_speed: 20, wind_gusts: 30, pressure: 1013, precipitation: 1 }),
      }))
    await mountPage()
    await searchAndPick('London')
    fireEvent.click(screen.getByRole('button', { name: '°F' }))

    // Act
    await searchAndPick('Paris')

    // Assert
    const hero = document.querySelector('.wx-hero') as HTMLElement
    expect(fetchWeatherMock).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Paris' }))
    expect(within(hero).getByText('Paris')).toBeInTheDocument()
    expect(hero.querySelector('.wx-temp')?.textContent).toBe('50°')
    expect(within(hero).getByText('12 mph NO')).toBeInTheDocument()
  })

  it('loads all in-scope readings in imperial when the persisted preference is °F', async () => {
    // Arrange
    localStorage.setItem('wx:units', JSON.stringify({ temp: 'f' }))
    searchCitiesMock.mockResolvedValue([LONDON])
    fetchWeatherMock.mockResolvedValue(payloadWithDetailedValues())
    await mountPage()

    // Act
    await searchAndPick('London')

    // Assert
    const hero = document.querySelector('.wx-hero') as HTMLElement
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true')
    expect(hero.querySelector('.wx-temp')?.textContent).toBe('70°')
    expect(document.querySelector('.wx-hg-temp')?.textContent).toBe('64°')
    expect(document.querySelector('.wx-drow .lo')?.textContent).toBe('54°')
    expect(screen.getByText('29.9 inHg')).toBeInTheDocument()
  })

  it('toggles a loaded dashboard back to metric instantly', async () => {
    // Arrange
    localStorage.setItem('wx:units', JSON.stringify({ temp: 'f' }))
    searchCitiesMock.mockResolvedValue([LONDON])
    fetchWeatherMock.mockResolvedValue(payloadWithDetailedValues())
    await mountPage()
    await searchAndPick('London')

    // Act
    fireEvent.click(screen.getByRole('button', { name: '°C' }))

    // Assert
    const hero = document.querySelector('.wx-hero') as HTMLElement
    expect(hero.querySelector('.wx-temp')?.textContent).toBe('21°')
    expect(within(hero).getByText('12 km/h NO')).toBeInTheDocument()
    expect(document.querySelector('.wx-hg-temp')?.textContent).toBe('18°')
    expect(document.querySelector('.wx-drow .lo')?.textContent).toBe('12°')
    expect(screen.getByText('1013 hPa')).toBeInTheDocument()
    expect(fetchWeatherMock).toHaveBeenCalledTimes(1)
  })
})
