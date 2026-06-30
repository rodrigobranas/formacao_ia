import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useWeather } from './use-weather'
import { fetchWeather } from '@/services/weather-api'
import { WeatherApiError } from '@/types/weather-api-error'
import type { WeatherPayload } from '@/types/weather-payload'

vi.mock('@/services/weather-api', () => ({
  fetchWeather: vi.fn(),
}))

const fetchWeatherMock = vi.mocked(fetchWeather)

const PAYLOAD = {
  location: { name: 'Curitiba', latitude: -25.4, longitude: -49.2 },
  current: { temperature: 18 },
} as unknown as WeatherPayload

const REQUEST = { latitude: -25.4, longitude: -49.2, name: 'Curitiba' }

describe('useWeather', () => {
  beforeEach(() => {
    fetchWeatherMock.mockReset()
  })

  it('#34 transitions loading then success with the payload', async () => {
    // Arrange
    fetchWeatherMock.mockResolvedValue(PAYLOAD)
    const { result } = renderHook(() => useWeather())

    // Act
    await act(async () => {
      await result.current.loadPlace(REQUEST)
    })

    // Assert
    expect(result.current.status).toBe('success')
    expect(result.current.data).toEqual(PAYLOAD)
  })

  it('#35 transitions to error and retry re-runs the request', async () => {
    // Arrange
    fetchWeatherMock.mockRejectedValueOnce(
      new WeatherApiError('upstream_unavailable', 'down'),
    )
    const { result } = renderHook(() => useWeather())

    // Act — first attempt fails
    await act(async () => {
      await result.current.loadPlace(REQUEST)
    })

    // Assert
    expect(result.current.status).toBe('error')
    expect(result.current.error?.code).toBe('upstream_unavailable')

    // Act — retry succeeds
    fetchWeatherMock.mockResolvedValueOnce(PAYLOAD)
    await act(async () => {
      result.current.retry()
    })

    // Assert
    expect(fetchWeatherMock).toHaveBeenCalledTimes(2)
    expect(fetchWeatherMock).toHaveBeenLastCalledWith(REQUEST)
    expect(result.current.status).toBe('success')
  })

  it('#36 sets the active city after a successful load', async () => {
    // Arrange
    fetchWeatherMock.mockResolvedValue(PAYLOAD)
    const { result } = renderHook(() => useWeather())

    // Act
    await act(async () => {
      await result.current.loadPlace(REQUEST)
    })

    // Assert
    expect(result.current.activeCity).toEqual(PAYLOAD.location)
  })
})
