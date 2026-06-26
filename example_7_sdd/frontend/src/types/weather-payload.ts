import type { GeoResult } from './geo-result'
import type { CurrentWeather } from './current-weather'
import type { HourlyForecast } from './hourly-forecast'
import type { DailyForecast } from './daily-forecast'
import type { AirQuality } from './air-quality'

export type WeatherPayload = {
  location: GeoResult
  current: CurrentWeather
  hourly: HourlyForecast[]
  daily: DailyForecast[]
  extras: {
    uv: { value: number; label: string } | null
    sun: { sunrise: string; sunset: string }
    air: AirQuality | null
  }
  units: {
    temperature: string
    wind_speed: string
  }
  fetched_at: string
}
