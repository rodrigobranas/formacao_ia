import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import type { RawForecast } from '../types/raw-forecast';
import { WeatherError } from '../types/weather-error';

vi.mock('../data/open-meteo-client', () => ({
  searchCities: vi.fn(),
  fetchForecast: vi.fn(),
  fetchAirQuality: vi.fn(),
}));

import * as openMeteo from '../data/open-meteo-client';
import { weatherRouter } from './weather-routes';

const mockedSearch = vi.mocked(openMeteo.searchCities);
const mockedForecast = vi.mocked(openMeteo.fetchForecast);
const mockedAirQuality = vi.mocked(openMeteo.fetchAirQuality);

function createApp(): Express {
  const app = express();
  app.use('/api/weather', weatherRouter);
  return app;
}

function buildForecastFixture(): RawForecast {
  const times = Array.from({ length: 25 }, (_, hour) => `2026-06-23T${String(hour % 24).padStart(2, '0')}:00`);
  const filled = (value: number) => times.map(() => value);
  return {
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2026-06-23T00:00',
      temperature_2m: 24,
      apparent_temperature: 26,
      relative_humidity_2m: 65,
      is_day: 1,
      weather_code: 2,
      wind_speed_10m: 12,
      wind_direction_10m: 180,
      wind_gusts_10m: 18,
      surface_pressure: 1013,
      cloud_cover: 45,
      precipitation: 0,
    },
    current_units: {},
    hourly: {
      time: times,
      temperature_2m: filled(24),
      weather_code: filled(2),
      precipitation_probability: filled(10),
      is_day: filled(1),
    },
    hourly_units: {},
    daily: {
      time: ['2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28', '2026-06-29'],
      weather_code: [2, 3, 1, 0, 61, 80, 95],
      temperature_2m_max: [28, 27, 26, 25, 24, 23, 22],
      temperature_2m_min: [18, 17, 16, 15, 14, 13, 12],
      precipitation_probability_max: [30, 40, 20, 10, 70, 80, 90],
      sunrise: Array(7).fill('2026-06-23T06:45'),
      sunset: Array(7).fill('2026-06-23T17:30'),
      uv_index_max: [6.2, 5, 4, 3, 2, 1, 0],
    },
    daily_units: {},
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/weather/search', () => {
  it('returns 200 with { results: [...] } (#1)', async () => {
    // Arrange
    mockedSearch.mockResolvedValue([
      { name: 'London', admin1: 'England', country: 'United Kingdom', country_code: 'GB', latitude: 51.5, longitude: -0.12, timezone: 'Europe/London' },
    ]);

    // Act
    const response = await request(createApp()).get('/api/weather/search?q=Lon');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(1);
    expect(response.body.results[0].name).toBe('London');
  });

  it('returns 400 invalid_request when q is missing or < 2 chars (#2)', async () => {
    // Arrange & Act
    const response = await request(createApp()).get('/api/weather/search?q=a');

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('invalid_request');
  });

  it('returns 200 { results: [] } when there is no match (#3)', async () => {
    // Arrange
    mockedSearch.mockResolvedValue([]);

    // Act
    const response = await request(createApp()).get('/api/weather/search?q=xyzxyz');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ results: [] });
  });
});

describe('GET /api/weather', () => {
  it('returns 200 with a complete WeatherPayload (#4)', async () => {
    // Arrange
    mockedForecast.mockResolvedValue(buildForecastFixture());
    mockedAirQuality.mockResolvedValue({
      current: { european_aqi: 35, pm2_5: 12.5, pm10: 22, ozone: 45, nitrogen_dioxide: 18 },
      current_units: { pm2_5: 'μg/m³', pm10: 'μg/m³', ozone: 'μg/m³', nitrogen_dioxide: 'μg/m³' },
    });

    // Act
    const response = await request(createApp()).get('/api/weather?lat=-23.5505&lon=-46.6333&name=S%C3%A3o%20Paulo');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.location.name).toBe('São Paulo');
    expect(response.body.current.condition.label).toBe('Parcialmente nublado');
    expect(response.body.hourly).toHaveLength(24);
    expect(response.body.daily).toHaveLength(7);
    expect(response.body.extras.air.european_aqi).toBe(35);
  });

  it('returns 400 invalid_request when lat/lon are missing or invalid (#5)', async () => {
    // Arrange & Act
    const response = await request(createApp()).get('/api/weather?lat=abc');

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('invalid_request');
  });

  it('returns 502 upstream_unavailable when Forecast is down (#6)', async () => {
    // Arrange
    mockedForecast.mockRejectedValue(new WeatherError('upstream_unavailable', 'down'));
    mockedAirQuality.mockResolvedValue(null);

    // Act
    const response = await request(createApp()).get('/api/weather?lat=-23.5505&lon=-46.6333');

    // Assert
    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('upstream_unavailable');
  });

  it('returns 200 with air: null when Air Quality is unavailable (#7)', async () => {
    // Arrange
    mockedForecast.mockResolvedValue(buildForecastFixture());
    mockedAirQuality.mockResolvedValue(null);

    // Act
    const response = await request(createApp()).get('/api/weather?lat=-23.5505&lon=-46.6333');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.extras.air).toBeNull();
  });
});

describe('error envelope', () => {
  it('always follows { error: { code, message } } (#8)', async () => {
    // Arrange & Act
    const response = await request(createApp()).get('/api/weather/search');

    // Assert
    expect(response.body).toHaveProperty('error.code');
    expect(response.body).toHaveProperty('error.message');
    expect(typeof response.body.error.message).toBe('string');
  });
});
