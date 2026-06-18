import {
  GeocodingResponse,
  ForecastResponse,
  WeatherData,
} from '../types/weather';

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

export async function geocodeCity(city: string): Promise<{
  name: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
}> {
  const url = new URL(GEOCODING_API_URL);
  url.searchParams.set('name', city);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'pt');
  url.searchParams.set('format', 'json');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as GeocodingResponse;

  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${city}" not found`);
  }

  const result = data.results[0];

  return {
    name: result.name,
    region: result.admin1 || result.admin2,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

export async function getForecast(
  latitude: number,
  longitude: number
): Promise<Omit<WeatherData, 'city' | 'region' | 'country'>> {
  const url = new URL(WEATHER_API_URL);
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('current', [
    'temperature_2m',
    'apparent_temperature',
    'relative_humidity_2m',
    'weather_code',
    'wind_speed_10m',
    'is_day',
  ].join(','));
  url.searchParams.set('daily', [
    'temperature_2m_max',
    'temperature_2m_min',
    'weather_code',
  ].join(','));
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '5');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as ForecastResponse;

  const forecast = data.daily.time.map((date, index) => ({
    date,
    maxTemperature: data.daily.temperature_2m_max[index],
    minTemperature: data.daily.temperature_2m_min[index],
    weatherCode: data.daily.weather_code[index],
  }));

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    current: {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m,
      isDay: data.current.is_day === 1,
      time: data.current.time,
    },
    forecast,
  };
}

export async function getWeatherByCity(city: string): Promise<WeatherData> {
  const location = await geocodeCity(city);
  const forecast = await getForecast(location.latitude, location.longitude);

  return {
    city: location.name,
    region: location.region,
    country: location.country,
    ...forecast,
  };
}

export async function getWeatherByCoordinates(
  latitude: number,
  longitude: number
): Promise<Omit<WeatherData, 'city' | 'region' | 'country'>> {
  return getForecast(latitude, longitude);
}
