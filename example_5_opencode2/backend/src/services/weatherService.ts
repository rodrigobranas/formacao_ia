interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  elevation: number
  feature_code: string
  country_code: string
  admin1_id?: number
  admin2_id?: number
  admin3_id?: number
  admin4_id?: number
  timezone: string
  population?: number
  postcodes?: string[]
  country_id?: number
  country: string
  admin1?: string
  admin2?: string
  admin3?: string
  admin4?: string
}

interface GeocodingResponse {
  results?: GeocodingResult[]
  generationtime_ms: number
}

interface NominatimAddress {
  city?: string
  town?: string
  village?: string
  municipality?: string
  suburb?: string
  county?: string
  state?: string
  country?: string
  country_code?: string
}

interface NominatimResponse {
  display_name: string
  address: NominatimAddress
}

interface CurrentWeather {
  time: string
  interval: number
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  weather_code: number
  wind_speed_10m: number
}

interface CurrentWeatherUnits {
  time: string
  interval: string
  temperature_2m: string
  relative_humidity_2m: string
  apparent_temperature: string
  weather_code: string
  wind_speed_10m: string
}

interface ForecastResponse {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current_units: CurrentWeatherUnits
  current: CurrentWeather
}

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

export interface WeatherError {
  message: string
  status: number
}

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast'
const REVERSE_GEOCODING_API = 'https://nominatim.openstreetmap.org/reverse'

export async function fetchCoordinates(
  city: string
): Promise<GeocodingResult | null> {
  const url = new URL(GEOCODING_API)
  url.searchParams.set('name', city)
  url.searchParams.set('count', '1')
  url.searchParams.set('language', 'pt')
  url.searchParams.set('format', 'json')

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`)
  }

  const data = (await response.json()) as GeocodingResponse
  return data.results?.[0] ?? null
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ city: string; country: string }> {
  const url = new URL(REVERSE_GEOCODING_API)
  url.searchParams.set('format', 'json')
  url.searchParams.set('lat', latitude.toString())
  url.searchParams.set('lon', longitude.toString())
  url.searchParams.set('zoom', '10')
  url.searchParams.set('accept-language', 'pt')

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'weather-panel/1.0 (https://github.com/example/weather-panel)',
    },
  })

  if (!response.ok) {
    return { city: 'Sua localização', country: '' }
  }

  const data = (await response.json()) as NominatimResponse
  const address = data.address
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.suburb ||
    address.county ||
    'Sua localização'
  const country = address.country || ''

  return { city, country }
}

export async function fetchWeatherByCoordinates(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = new URL(FORECAST_API)
  url.searchParams.set('latitude', latitude.toString())
  url.searchParams.set('longitude', longitude.toString())
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m'
  )
  url.searchParams.set('timezone', 'auto')

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Forecast API error: ${response.status}`)
  }

  const data = (await response.json()) as ForecastResponse
  const current = data.current
  const units = data.current_units

  return {
    city: '',
    country: '',
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
    unitTemperature: units.temperature_2m,
    unitWindSpeed: units.wind_speed_10m,
    unitHumidity: units.relative_humidity_2m,
  }
}

export async function fetchWeatherByCity(
  city: string
): Promise<WeatherData> {
  const location = await fetchCoordinates(city)

  if (!location) {
    const error: WeatherError = {
      message: `Cidade "${city}" não encontrada.`,
      status: 404,
    }
    throw error
  }

  const weather = await fetchWeatherByCoordinates(
    location.latitude,
    location.longitude
  )

  return {
    ...weather,
    city: location.name,
    country: location.country,
    admin1: location.admin1,
  }
}

export async function fetchWeatherByCoordinatesWithLocation(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const [weather, location] = await Promise.all([
    fetchWeatherByCoordinates(latitude, longitude),
    reverseGeocode(latitude, longitude),
  ])

  return {
    ...weather,
    city: location.city,
    country: location.country,
  }
}
