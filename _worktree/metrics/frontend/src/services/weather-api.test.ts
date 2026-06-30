import { describe, it, expect, vi, afterEach } from 'vitest'
import { searchCities, fetchWeather } from './weather-api'
import { WeatherApiError } from '@/types/weather-api-error'

function stubFetch(response: Partial<Response> & { jsonValue?: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: () => Promise.resolve(response.jsonValue),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('weather-api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('#27 searchCities calls relative /api/weather/search?q= and maps results', async () => {
    // Arrange
    const results = [{ name: 'London', admin1: 'England', country: 'UK' }]
    const fetchMock = stubFetch({ jsonValue: { results } })

    // Act
    const cities = await searchCities('Lon don')

    // Assert
    expect(fetchMock).toHaveBeenCalledWith('/api/weather/search?q=Lon%20don')
    expect(cities).toEqual(results)
  })

  it('#27 searchCities returns [] when backend omits results', async () => {
    // Arrange
    stubFetch({ jsonValue: {} })

    // Act
    const cities = await searchCities('xyz')

    // Assert
    expect(cities).toEqual([])
  })

  it('#28 fetchWeather calls relative /api/weather?lat&lon and maps WeatherPayload', async () => {
    // Arrange
    const payload = { location: { name: 'Lisboa' }, current: { temperature: 21 } }
    const fetchMock = stubFetch({ jsonValue: payload })

    // Act
    const result = await fetchWeather({ latitude: 38.7, longitude: -9.1, name: 'Lisboa' })

    // Assert
    expect(fetchMock).toHaveBeenCalledWith('/api/weather?lat=38.7&lon=-9.1&name=Lisboa')
    expect(result).toEqual(payload)
  })

  it('#29 maps 404 to city_not_found', async () => {
    // Arrange
    stubFetch({ ok: false, status: 404 })

    // Act / Assert
    await expect(fetchWeather({ latitude: 0, longitude: 0 })).rejects.toMatchObject({
      code: 'city_not_found',
    })
  })

  it('#29 maps 502 to upstream_unavailable', async () => {
    // Arrange
    stubFetch({ ok: false, status: 502 })

    // Act / Assert
    await expect(fetchWeather({ latitude: 0, longitude: 0 })).rejects.toMatchObject({
      code: 'upstream_unavailable',
    })
  })

  it('#29 maps a network failure to network_error', async () => {
    // Arrange
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')))

    // Act
    const error = await searchCities('London').catch((caught) => caught)

    // Assert
    expect(error).toBeInstanceOf(WeatherApiError)
    expect(error.code).toBe('network_error')
  })
})
