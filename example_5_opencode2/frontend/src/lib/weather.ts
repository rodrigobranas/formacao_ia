export interface WeatherData {
  city: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
  timezone: string
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
  unitTemperature: string
  unitWindSpeed: string
  unitHumidity: string
}

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'freezing-rain'
  | 'snow'
  | 'thunderstorm'
  | 'unknown'

export function getWeatherCondition(code: number): WeatherCondition {
  if (code === 0) return 'clear'
  if (code >= 1 && code <= 3) return 'partly-cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if (code >= 61 && code <= 67) return 'rain'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 82) return 'rain'
  if (code >= 85 && code <= 86) return 'snow'
  if (code >= 95 && code <= 99) return 'thunderstorm'
  return 'unknown'
}

export function getWeatherLabel(condition: WeatherCondition): string {
  const labels: Record<WeatherCondition, string> = {
    clear: 'Céu limpo',
    'partly-cloudy': 'Parcialmente nublado',
    cloudy: 'Nublado',
    fog: 'Neblina',
    drizzle: 'Chuvisco',
    rain: 'Chuva',
    'freezing-rain': 'Chuva congelante',
    snow: 'Neve',
    thunderstorm: 'Trovoada',
    unknown: 'Condição desconhecida',
  }
  return labels[condition]
}

export function formatTemperature(
  value: number,
  unit: string
): string {
  return `${Math.round(value)}${unit}`
}

export function formatWind(value: number, unit: string): string {
  return `${value.toFixed(1)} ${unit}`
}
