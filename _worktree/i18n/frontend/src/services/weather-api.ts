import type { GeoResult } from '@/types/geo-result'
import type { WeatherPayload } from '@/types/weather-payload'
import type { WeatherRequest } from '@/types/weather-request'
import type { WeatherErrorCode } from '@/types/weather-error-code'
import { WeatherApiError } from '@/types/weather-api-error'

const STATUS_ERROR: Record<number, WeatherErrorCode> = {
  404: 'city_not_found',
  502: 'upstream_unavailable',
}

function buildError(code: WeatherErrorCode): WeatherApiError {
  return new WeatherApiError(code)
}

function toErrorCode(status: number): WeatherErrorCode {
  return STATUS_ERROR[status] ?? 'upstream_unavailable'
}

async function requestJson(path: string): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(path)
  } catch {
    throw buildError('network_error')
  }
  if (!response.ok) {
    throw buildError(toErrorCode(response.status))
  }
  return response.json()
}

export async function searchCities(term: string): Promise<GeoResult[]> {
  const data = await requestJson(`/api/weather/search?q=${encodeURIComponent(term)}`)
  const results = (data as { results?: GeoResult[] }).results
  return results ?? []
}

function buildWeatherQuery(request: WeatherRequest): string {
  const params = new URLSearchParams()
  params.set('lat', String(request.latitude))
  params.set('lon', String(request.longitude))
  if (request.name) params.set('name', request.name)
  if (request.admin1) params.set('admin1', request.admin1)
  if (request.country) params.set('country', request.country)
  if (request.country_code) params.set('country_code', request.country_code)
  return params.toString()
}

export async function fetchWeather(request: WeatherRequest): Promise<WeatherPayload> {
  const data = await requestJson(`/api/weather?${buildWeatherQuery(request)}`)
  return data as WeatherPayload
}
