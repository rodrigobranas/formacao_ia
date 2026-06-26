import type { GeoResult } from '@/types/geo-result'
import type { CurrentWeather } from '@/types/current-weather'
import type { HourlyForecast } from '@/types/hourly-forecast'
import type { DailyForecast } from '@/types/daily-forecast'
import type { AirQuality } from '@/types/air-quality'
import type { WeatherPayload } from '@/types/weather-payload'

export const LONDON: GeoResult = {
  name: 'London',
  admin1: 'England',
  country: 'United Kingdom',
  country_code: 'GB',
  latitude: 51.5072,
  longitude: -0.1276,
  timezone: 'Europe/London',
}

export function buildCurrent(overrides: Partial<CurrentWeather> = {}): CurrentWeather {
  return {
    time: '2026-06-25T14:00',
    temperature: 21.4,
    apparent_temperature: 20.1,
    condition: { code: 2, label: 'Parcialmente nublado', group: 'cloudy' },
    is_day: 1,
    humidity: 58,
    wind_speed: 12,
    wind_direction: 315,
    wind_cardinal: 'NO',
    wind_gusts: 24,
    pressure: 1014,
    cloud_cover: 40,
    precipitation: 0,
    ...overrides,
  }
}

function buildHours(): HourlyForecast[] {
  return Array.from({ length: 24 }, (_value, index) => ({
    time: `2026-06-25T${String(index).padStart(2, '0')}:00`,
    temperature: 18 + (index % 6),
    weather_code: 2,
    precipitation_probability: index % 3 === 0 ? 20 : 0,
    is_day: index >= 6 && index <= 20 ? 1 : 0,
  }))
}

function buildDays(): DailyForecast[] {
  return Array.from({ length: 7 }, (_value, index) => ({
    date: `2026-06-${String(25 + index).padStart(2, '0')}`,
    weather_code: index % 2 === 0 ? 2 : 61,
    temp_min: 12 + index,
    temp_max: 22 + index,
    precipitation_probability_max: index % 2 === 0 ? 30 : 0,
    sunrise: `2026-06-${String(25 + index).padStart(2, '0')}T05:45`,
    sunset: `2026-06-${String(25 + index).padStart(2, '0')}T20:30`,
    uv_index_max: 6,
  }))
}

export function buildAirQuality(overrides: Partial<AirQuality> = {}): AirQuality {
  return {
    european_aqi: 32,
    category: { label: 'Razoável', description: 'Aceitável para a maioria das pessoas.' },
    pollutants: { pm2_5: 8, pm10: 14, ozone: 60, nitrogen_dioxide: 12 },
    units: { pm2_5: 'µg/m³', pm10: 'µg/m³', ozone: 'µg/m³', nitrogen_dioxide: 'µg/m³' },
    ...overrides,
  }
}

export function buildPayload(overrides: Partial<WeatherPayload> = {}): WeatherPayload {
  return {
    location: LONDON,
    current: buildCurrent(),
    hourly: buildHours(),
    daily: buildDays(),
    extras: {
      uv: { value: 6, label: 'Alto' },
      sun: { sunrise: '2026-06-25T05:45', sunset: '2026-06-25T20:30' },
      air: buildAirQuality(),
    },
    units: { temperature: '°C', wind_speed: 'km/h' },
    fetched_at: '2026-06-25T14:00',
    ...overrides,
  }
}
