import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, screen, fireEvent, within } from '@testing-library/react'
import { WeatherDashboardPage } from './weather-dashboard-page'
import { searchCities, fetchWeather } from '@/services/weather-api'
import { fetchHealth } from '@/services/health-api'
import { WeatherApiError } from '@/types/weather-api-error'
import { buildPayload, LONDON } from '@/test/fixtures'
import { renderWithI18n } from '@/i18n/test-utils'

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
    renderWithI18n(<WeatherDashboardPage />)

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
    renderWithI18n(<WeatherDashboardPage />)

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
    renderWithI18n(<WeatherDashboardPage />)

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
    renderWithI18n(<WeatherDashboardPage />)

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
    fetchWeatherMock.mockRejectedValueOnce(new WeatherApiError('network_error'))
    renderWithI18n(<WeatherDashboardPage />)

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

  it('renders the idle state in English', async () => {
    renderWithI18n(<WeatherDashboardPage />, { locale: 'en' })

    expect(screen.getByText('Search for a city or use your location to see the weather.')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Search city' })).toBeInTheDocument()

    await act(async () => {
      await Promise.resolve()
    })
  })

  it('switches locale and re-renders API labels without reloading', async () => {
    searchCitiesMock.mockResolvedValue([LONDON])
    fetchWeatherMock.mockResolvedValue(buildPayload())
    renderWithI18n(<WeatherDashboardPage />)

    await searchAndPick('London')
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.getByText('Partly cloudy')).toBeInTheDocument()
    expect(screen.queryByText('Parcialmente nublado')).not.toBeInTheDocument()
  })
})
