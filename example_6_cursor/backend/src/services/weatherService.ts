import { parseCoordinate } from '../data/coordinateParser';
import { fetchForecast, findLocationByCity } from '../data/openMeteoClient';
import { HttpError } from '../types/http-error';
import type { GeocodingResult } from '../types/geocoding-result';
import type { ForecastResponse } from '../types/forecast-response';
import type { WeatherQuery } from '../types/weather-query';
import type { WeatherReport } from '../types/weather-report';

type ResolvedCoordinates = {
  latitude: number;
  longitude: number;
  location: GeocodingResult | null;
};

async function resolveLocation(query: WeatherQuery): Promise<ResolvedCoordinates> {
  const hasCoordinates = query.latitude !== undefined || query.longitude !== undefined;

  if (hasCoordinates) {
    return {
      latitude: parseCoordinate(query.latitude, 'latitude'),
      longitude: parseCoordinate(query.longitude, 'longitude'),
      location: null,
    };
  }

  if (typeof query.city !== 'string' || query.city.trim() === '') {
    throw new HttpError(400, 'city or coordinates are required');
  }

  const location = await findLocationByCity(query.city.trim());

  return {
    latitude: location.latitude,
    longitude: location.longitude,
    location,
  };
}

function mapForecastToReport(
  forecast: ForecastResponse,
  location: GeocodingResult | null,
): WeatherReport {
  return {
    location: {
      name: location?.name ?? 'Your location',
      country: location?.country ?? null,
      region: location?.admin1 ?? null,
      latitude: forecast.latitude,
      longitude: forecast.longitude,
      timezone: location?.timezone ?? forecast.timezone,
    },
    current: {
      time: forecast.current.time,
      temperature: forecast.current.temperature_2m,
      apparentTemperature: forecast.current.apparent_temperature,
      relativeHumidity: forecast.current.relative_humidity_2m,
      precipitation: forecast.current.precipitation,
      weatherCode: forecast.current.weather_code,
      windSpeed: forecast.current.wind_speed_10m,
      windDirection: forecast.current.wind_direction_10m,
      isDay: forecast.current.is_day === 1,
    },
    units: {
      temperature: forecast.current_units.temperature_2m,
      apparentTemperature: forecast.current_units.apparent_temperature,
      relativeHumidity: forecast.current_units.relative_humidity_2m,
      precipitation: forecast.current_units.precipitation,
      windSpeed: forecast.current_units.wind_speed_10m,
      windDirection: forecast.current_units.wind_direction_10m,
    },
  };
}

export async function buildWeatherReport(query: WeatherQuery): Promise<WeatherReport> {
  const resolved = await resolveLocation(query);
  const forecast = await fetchForecast(resolved.latitude, resolved.longitude);

  return mapForecastToReport(forecast, resolved.location);
}
