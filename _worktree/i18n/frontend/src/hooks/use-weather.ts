import { useCallback, useMemo, useRef, useState } from 'react'
import type { WeatherPayload } from '@/types/weather-payload'
import type { WeatherRequest } from '@/types/weather-request'
import type { WeatherStatus } from '@/types/weather-status'
import { WeatherApiError } from '@/types/weather-api-error'
import { fetchWeather } from '@/services/weather-api'

function toWeatherApiError(caught: unknown): WeatherApiError {
  if (caught instanceof WeatherApiError) {
    return caught
  }
  return new WeatherApiError('network_error')
}

export function useWeather() {
  const [status, setStatus] = useState<WeatherStatus>('idle')
  const [data, setData] = useState<WeatherPayload | null>(null)
  const [error, setError] = useState<WeatherApiError | null>(null)
  const lastRequest = useRef<WeatherRequest | null>(null)
  const requestId = useRef(0)

  const loadPlace = useCallback(async (request: WeatherRequest) => {
    lastRequest.current = request
    const currentId = ++requestId.current
    setStatus('loading')
    setError(null)
    try {
      const payload = await fetchWeather(request)
      if (requestId.current !== currentId) return
      setData(payload)
      setStatus('success')
    } catch (caught) {
      if (requestId.current !== currentId) return
      setError(toWeatherApiError(caught))
      setStatus('error')
    }
  }, [])

  const retry = useCallback(() => {
    if (lastRequest.current) void loadPlace(lastRequest.current)
  }, [loadPlace])

  const activeCity = useMemo(() => data?.location ?? null, [data])

  return { status, data, error, activeCity, loadPlace, retry }
}
