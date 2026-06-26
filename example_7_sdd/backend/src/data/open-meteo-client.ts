import type { Coordinates } from '../types/coordinates';
import type { GeoResult } from '../types/geo-result';
import type { RawForecast } from '../types/raw-forecast';
import type { RawAirQuality } from '../types/raw-air-quality';
import { WeatherError } from '../types/weather-error';

const UPSTREAM_TIMEOUT_MS = 8000;

const CURRENT_VARS =
  'temperature_2m,apparent_temperature,relative_humidity_2m,is_day,' +
  'weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,' +
  'surface_pressure,cloud_cover,precipitation';
const HOURLY_VARS = 'temperature_2m,weather_code,precipitation_probability,is_day';
const DAILY_VARS =
  'weather_code,temperature_2m_max,temperature_2m_min,' +
  'precipitation_probability_max,sunrise,sunset,uv_index_max';
const AIR_QUALITY_VARS = 'european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide';

function resolveGeocodingUrl(): string {
  return process.env.OPEN_METEO_GEOCODING_URL ?? 'https://geocoding-api.open-meteo.com/v1/search';
}

function resolveForecastUrl(): string {
  return process.env.OPEN_METEO_FORECAST_URL ?? 'https://api.open-meteo.com/v1/forecast';
}

function resolveAirQualityUrl(): string {
  return process.env.OPEN_METEO_AIR_QUALITY_URL ?? 'https://air-quality-api.open-meteo.com/v1/air-quality';
}

function buildUrl(base: string, params: Record<string, string>): string {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

function toUpstreamError(error: unknown): WeatherError {
  if (error instanceof WeatherError) {
    return error;
  }
  return new WeatherError('upstream_unavailable', 'Weather data source is temporarily unavailable.');
}

async function fetchUpstreamJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return await parseUpstreamResponse(response);
  } catch (error) {
    throw toUpstreamError(error);
  } finally {
    clearTimeout(timer);
  }
}

async function parseUpstreamResponse(response: Response): Promise<unknown> {
  if (!response.ok) {
    throw new WeatherError('upstream_unavailable', 'Weather data source is temporarily unavailable.');
  }
  const body = (await response.json()) as { error?: boolean };
  if (body && body.error) {
    throw new WeatherError('upstream_unavailable', 'Weather data source is temporarily unavailable.');
  }
  return body;
}

function toNullable(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function toGeoResult(raw: Record<string, unknown>): GeoResult {
  return {
    name: String(raw.name),
    admin1: toNullable(raw.admin1),
    country: toNullable(raw.country),
    country_code: toNullable(raw.country_code),
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    timezone: toNullable(raw.timezone),
  };
}

export async function searchCities(term: string, limit: number): Promise<GeoResult[]> {
  const url = buildUrl(resolveGeocodingUrl(), {
    name: term,
    count: String(limit),
    language: 'pt',
    format: 'json',
  });
  const body = (await fetchUpstreamJson(url)) as { results?: Record<string, unknown>[] };
  if (!body.results) {
    return [];
  }
  return body.results.map(toGeoResult);
}

export async function fetchForecast(coords: Coordinates): Promise<RawForecast> {
  const url = buildUrl(resolveForecastUrl(), {
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    current: CURRENT_VARS,
    hourly: HOURLY_VARS,
    daily: DAILY_VARS,
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: '7',
  });
  return (await fetchUpstreamJson(url)) as RawForecast;
}

export async function fetchAirQuality(coords: Coordinates): Promise<RawAirQuality | null> {
  const url = buildUrl(resolveAirQualityUrl(), {
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    current: AIR_QUALITY_VARS,
    timezone: 'auto',
  });
  try {
    return (await fetchUpstreamJson(url)) as RawAirQuality;
  } catch {
    return null;
  }
}
