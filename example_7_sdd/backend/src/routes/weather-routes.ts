import { Router, Request, Response } from 'express';
import * as weatherService from '../services/weather-service';
import { WeatherError, WeatherErrorCode } from '../types/weather-error';
import type { WeatherQuery } from '../types/weather-query';

const ERROR_STATUS: Record<WeatherErrorCode, number> = {
  invalid_request: 400,
  city_not_found: 404,
  upstream_unavailable: 502,
};

const LOCATION_HINT_KEYS = ['name', 'admin1', 'country', 'country_code'];

export const weatherRouter = Router();

function sendError(res: Response, error: WeatherError): void {
  const status = ERROR_STATUS[error.code] ?? 500;
  res.status(status).json({ error: { code: error.code, message: error.message } });
}

function toWeatherError(error: unknown): WeatherError {
  if (error instanceof WeatherError) {
    return error;
  }
  return new WeatherError('upstream_unavailable', 'Weather data source is temporarily unavailable.');
}

function toCoordinate(raw: unknown, bound: number): number | null {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return null;
  }
  const value = Number(raw);
  if (Number.isNaN(value) || Math.abs(value) > bound) {
    return null;
  }
  return value;
}

function readLocationHints(req: Request): Partial<WeatherQuery> {
  const hints: Record<string, string> = {};
  LOCATION_HINT_KEYS.forEach((key) => {
    const value = req.query[key];
    if (typeof value === 'string' && value.length > 0) {
      hints[key] = value;
    }
  });
  return hints;
}

function parseWeatherQuery(req: Request): WeatherQuery | null {
  const latitude = toCoordinate(req.query.lat, 90);
  const longitude = toCoordinate(req.query.lon, 180);
  if (latitude === null || longitude === null) {
    return null;
  }
  return { latitude, longitude, ...readLocationHints(req) };
}

async function handleSearch(req: Request, res: Response): Promise<void> {
  const term = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (term.length < 2) {
    sendError(res, new WeatherError('invalid_request', 'Search term must be at least 2 characters.'));
    return;
  }
  try {
    res.json({ results: await weatherService.searchCities(term) });
  } catch (error) {
    sendError(res, toWeatherError(error));
  }
}

async function handleGetWeather(req: Request, res: Response): Promise<void> {
  const query = parseWeatherQuery(req);
  if (!query) {
    sendError(res, new WeatherError('invalid_request', 'Valid lat and lon query params are required.'));
    return;
  }
  try {
    res.json(await weatherService.getWeather(query));
  } catch (error) {
    sendError(res, toWeatherError(error));
  }
}

weatherRouter.get('/search', handleSearch);
weatherRouter.get('/', handleGetWeather);
