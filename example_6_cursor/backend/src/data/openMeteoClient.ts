import { HttpError } from '../types/http-error';
import type { GeocodingResponse } from '../types/geocoding-response';
import type { GeocodingResult } from '../types/geocoding-result';
import type { ForecastResponse } from '../types/forecast-response';

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new HttpError(response.status, 'Weather provider request failed');
  }

  return response.json() as Promise<T>;
}

export async function findLocationByCity(city: string): Promise<GeocodingResult> {
  const url = new URL(GEOCODING_API_URL);
  url.searchParams.set('name', city);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'pt');
  url.searchParams.set('format', 'json');

  const data = await fetchJson<GeocodingResponse>(url);
  const location = data.results?.[0];

  if (!location) {
    throw new HttpError(404, 'City not found');
  }

  return location;
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
): Promise<ForecastResponse> {
  const url = new URL(FORECAST_API_URL);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
  );
  url.searchParams.set('timezone', 'auto');

  return fetchJson<ForecastResponse>(url);
}
