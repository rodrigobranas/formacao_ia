import * as openMeteo from '../data/open-meteo-client';
import { toCondition, toUvCategory, toAirQualityCategory } from './weather-codes';
import type { GeoResult } from '../types/geo-result';
import type { WeatherQuery } from '../types/weather-query';
import type { WeatherPayload } from '../types/weather-payload';
import type { CurrentWeather } from '../types/current-weather';
import type { HourlyForecast } from '../types/hourly-forecast';
import type { DailyForecast } from '../types/daily-forecast';
import type { AirQuality } from '../types/air-quality';
import type { RawForecast } from '../types/raw-forecast';
import type { RawAirQuality } from '../types/raw-air-quality';

const DEFAULT_SEARCH_LIMIT = 6;
const HOURLY_WINDOW = 24;
const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

export async function searchCities(term: string): Promise<GeoResult[]> {
  return openMeteo.searchCities(term, DEFAULT_SEARCH_LIMIT);
}

export async function getWeather(query: WeatherQuery): Promise<WeatherPayload> {
  const coords = { latitude: query.latitude, longitude: query.longitude };
  const [forecast, air] = await Promise.all([
    openMeteo.fetchForecast(coords),
    openMeteo.fetchAirQuality(coords),
  ]);
  return assembleWeatherPayload(forecast, air, query);
}

function assembleWeatherPayload(
  forecast: RawForecast,
  air: RawAirQuality | null,
  query: WeatherQuery,
): WeatherPayload {
  return {
    location: buildLocation(forecast, query),
    current: buildCurrent(forecast),
    hourly: buildHourly(forecast),
    daily: buildDaily(forecast),
    extras: buildExtras(forecast, air),
    units: { temperature: '°C', wind_speed: 'km/h' },
    fetched_at: new Date().toISOString(),
  };
}

function buildLocation(forecast: RawForecast, query: WeatherQuery): GeoResult {
  return {
    name: query.name ?? 'Localização atual',
    admin1: query.admin1 ?? null,
    country: query.country ?? null,
    country_code: query.country_code ?? null,
    latitude: forecast.latitude,
    longitude: forecast.longitude,
    timezone: forecast.timezone,
  };
}

function buildCurrent(forecast: RawForecast): CurrentWeather {
  const current = forecast.current;
  const direction = Number(current.wind_direction_10m);
  return {
    time: String(current.time),
    temperature: Number(current.temperature_2m),
    apparent_temperature: Number(current.apparent_temperature),
    condition: toCondition(Number(current.weather_code)),
    is_day: Number(current.is_day),
    humidity: Number(current.relative_humidity_2m),
    wind_speed: Number(current.wind_speed_10m),
    wind_direction: direction,
    wind_cardinal: toCardinal(direction),
    wind_gusts: Number(current.wind_gusts_10m),
    pressure: Number(current.surface_pressure),
    cloud_cover: Number(current.cloud_cover),
    precipitation: Number(current.precipitation),
  };
}

function toCardinal(degrees: number): string {
  const index = Math.round(degrees / 45) % CARDINALS.length;
  return CARDINALS[index];
}

function buildHourly(forecast: RawForecast): HourlyForecast[] {
  const hourly = forecast.hourly;
  const times = hourly.time as string[];
  const start = findHourlyStart(times, String(forecast.current.time));
  return times
    .slice(start, start + HOURLY_WINDOW)
    .map((time, offset) => buildHourlyEntry(hourly, start + offset, time));
}

function findHourlyStart(times: string[], currentTime: string): number {
  const index = times.findIndex((time) => time >= currentTime);
  return index === -1 ? 0 : index;
}

function buildHourlyEntry(
  hourly: RawForecast['hourly'],
  index: number,
  time: string,
): HourlyForecast {
  return {
    time,
    temperature: Number(hourly.temperature_2m[index]),
    weather_code: Number(hourly.weather_code[index]),
    precipitation_probability: Number(hourly.precipitation_probability[index]),
    is_day: Number(hourly.is_day[index]),
  };
}

function buildDaily(forecast: RawForecast): DailyForecast[] {
  const daily = forecast.daily;
  const dates = daily.time as string[];
  return dates.map((date, index) => buildDailyEntry(daily, index, date));
}

function buildDailyEntry(
  daily: RawForecast['daily'],
  index: number,
  date: string,
): DailyForecast {
  return {
    date,
    weather_code: Number(daily.weather_code[index]),
    temp_min: Number(daily.temperature_2m_min[index]),
    temp_max: Number(daily.temperature_2m_max[index]),
    precipitation_probability_max: Number(daily.precipitation_probability_max[index]),
    sunrise: String(daily.sunrise[index]),
    sunset: String(daily.sunset[index]),
    uv_index_max: Number(daily.uv_index_max[index]),
  };
}

function buildExtras(forecast: RawForecast, air: RawAirQuality | null) {
  const uvValue = Number(forecast.daily.uv_index_max[0]);
  const uvCategory = toUvCategory(uvValue);
  return {
    uv: uvCategory ? { value: uvValue, label: uvCategory.label } : null,
    sun: {
      sunrise: String(forecast.daily.sunrise[0]),
      sunset: String(forecast.daily.sunset[0]),
    },
    air: buildAir(air),
  };
}

function toNumberOrNull(value: number | string | null | undefined): number | null {
  return value === null || value === undefined ? null : Number(value);
}

function buildAir(air: RawAirQuality | null): AirQuality | null {
  if (!air) {
    return null;
  }
  const eaqi = toNumberOrNull(air.current.european_aqi);
  const category = toAirQualityCategory(eaqi);
  if (eaqi === null || !category) {
    return null;
  }
  return {
    european_aqi: eaqi,
    category,
    pollutants: buildPollutants(air),
    units: buildPollutantUnits(air),
  };
}

function buildPollutants(air: RawAirQuality): AirQuality['pollutants'] {
  const current = air.current;
  return {
    pm2_5: toNumberOrNull(current.pm2_5),
    pm10: toNumberOrNull(current.pm10),
    ozone: toNumberOrNull(current.ozone),
    nitrogen_dioxide: toNumberOrNull(current.nitrogen_dioxide),
  };
}

function buildPollutantUnits(air: RawAirQuality): AirQuality['units'] {
  const units = air.current_units;
  const fallback = 'μg/m³';
  return {
    pm2_5: units.pm2_5 ?? fallback,
    pm10: units.pm10 ?? fallback,
    ozone: units.ozone ?? fallback,
    nitrogen_dioxide: units.nitrogen_dioxide ?? fallback,
  };
}
