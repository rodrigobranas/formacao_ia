import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react'

/** Base URL of the backend that proxies the Open-Meteo APIs. */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export interface WeatherLocation {
  name: string
  country?: string
  admin1?: string
  latitude: number
  longitude: number
  timezone?: string
}

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
  weatherDescription: string
  isDay: boolean
  time: string
  units: {
    temperature: string
    windSpeed: string
    humidity: string
  }
}

export interface WeatherResult {
  location: WeatherLocation
  current: CurrentWeather
}

interface ApiError {
  error?: string
}

async function requestWeather(query: string): Promise<WeatherResult> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/weather?${query}`)
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
    )
  }

  let body: WeatherResult | ApiError
  try {
    body = await response.json()
  } catch {
    throw new Error('Resposta inválida do servidor.')
  }

  if (!response.ok) {
    const message = (body as ApiError).error ?? 'Erro ao buscar o clima.'
    throw new Error(message)
  }

  return body as WeatherResult
}

/** Fetch the current weather for a city by name (via the backend). */
export function fetchWeatherByCity(city: string): Promise<WeatherResult> {
  return requestWeather(`city=${encodeURIComponent(city)}`)
}

/** Fetch the current weather for coordinates (via the backend). */
export function fetchWeatherByCoordinates(
  latitude: number,
  longitude: number,
): Promise<WeatherResult> {
  return requestWeather(`lat=${latitude}&lon=${longitude}`)
}

/**
 * Map a WMO weather code (and day/night) to a Lucide icon and a background
 * gradient so the panel can reflect the conditions visually.
 */
export function getWeatherVisuals(code: number, isDay: boolean): {
  Icon: LucideIcon
  gradient: string
} {
  const clearGradient = isDay
    ? 'from-sky-400 to-blue-600'
    : 'from-slate-800 to-slate-950'
  const cloudGradient = isDay
    ? 'from-slate-400 to-slate-600'
    : 'from-slate-700 to-slate-900'
  const rainGradient = 'from-slate-500 to-slate-800'
  const snowGradient = isDay ? 'from-sky-200 to-slate-400' : 'from-slate-600 to-slate-800'
  const stormGradient = 'from-slate-700 to-indigo-950'
  const fogGradient = 'from-slate-400 to-slate-500'

  // Clear sky
  if (code === 0) {
    return { Icon: isDay ? Sun : Moon, gradient: clearGradient }
  }
  // Mainly clear / partly cloudy
  if (code === 1 || code === 2) {
    return { Icon: isDay ? CloudSun : CloudMoon, gradient: cloudGradient }
  }
  // Overcast
  if (code === 3) {
    return { Icon: Cloudy, gradient: cloudGradient }
  }
  // Fog
  if (code === 45 || code === 48) {
    return { Icon: CloudFog, gradient: fogGradient }
  }
  // Drizzle / freezing drizzle
  if (code >= 51 && code <= 57) {
    return { Icon: CloudDrizzle, gradient: rainGradient }
  }
  // Rain / freezing rain
  if (code >= 61 && code <= 67) {
    return { Icon: CloudRain, gradient: rainGradient }
  }
  // Snow fall / snow grains
  if (code >= 71 && code <= 77) {
    return { Icon: CloudSnow, gradient: snowGradient }
  }
  // Rain showers
  if (code >= 80 && code <= 82) {
    return { Icon: CloudRain, gradient: rainGradient }
  }
  // Snow showers
  if (code === 85 || code === 86) {
    return { Icon: CloudSnow, gradient: snowGradient }
  }
  // Thunderstorm
  if (code === 95) {
    return { Icon: CloudLightning, gradient: stormGradient }
  }
  // Thunderstorm with hail
  if (code === 96 || code === 99) {
    return { Icon: CloudHail, gradient: stormGradient }
  }

  return { Icon: Cloud, gradient: cloudGradient }
}

/** Build a readable location label, e.g. "São Paulo, SP · Brasil". */
export function formatLocation(location: WeatherLocation): string {
  const parts = [location.name]
  if (location.admin1 && location.admin1 !== location.name) {
    parts.push(location.admin1)
  }
  const head = parts.join(', ')
  return location.country ? `${head} · ${location.country}` : head
}
