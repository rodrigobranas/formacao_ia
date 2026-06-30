import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RawForecast } from '../types/raw-forecast';
import type { RawAirQuality } from '../types/raw-air-quality';
import { WeatherError } from '../types/weather-error';

vi.mock('../data/open-meteo-client', () => ({
  searchCities: vi.fn(),
  fetchForecast: vi.fn(),
  fetchAirQuality: vi.fn(),
}));

import * as openMeteo from '../data/open-meteo-client';
import { searchCities, getWeather } from './weather-service';

const mockedSearch = vi.mocked(openMeteo.searchCities);
const mockedForecast = vi.mocked(openMeteo.fetchForecast);
const mockedAirQuality = vi.mocked(openMeteo.fetchAirQuality);

function buildHourlyTimes(): string[] {
  const times: string[] = [];
  for (let hour = 0; hour < 48; hour++) {
    const day = hour < 24 ? 23 : 24;
    const label = String(hour % 24).padStart(2, '0');
    times.push(`2026-06-${day}T${label}:00`);
  }
  return times;
}

function buildForecastFixture(): RawForecast {
  const times = buildHourlyTimes();
  const filled = (value: number) => times.map(() => value);
  return {
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2026-06-23T14:00',
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
    current_units: { temperature_2m: '°C', wind_speed_10m: 'km/h' },
    hourly: {
      time: times,
      temperature_2m: filled(24),
      weather_code: filled(2),
      precipitation_probability: filled(10),
      is_day: filled(1),
    },
    hourly_units: { temperature_2m: '°C' },
    daily: {
      time: ['2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28', '2026-06-29'],
      weather_code: [2, 3, 1, 0, 61, 80, 95],
      temperature_2m_max: [28, 27, 26, 25, 24, 23, 22],
      temperature_2m_min: [18, 17, 16, 15, 14, 13, 12],
      precipitation_probability_max: [30, 40, 20, 10, 70, 80, 90],
      sunrise: ['2026-06-23T06:45', 'b', 'c', 'd', 'e', 'f', 'g'],
      sunset: ['2026-06-23T17:30', 'b', 'c', 'd', 'e', 'f', 'g'],
      uv_index_max: [6.2, 5, 4, 3, 2, 1, 0],
    },
    daily_units: { temperature_2m_max: '°C' },
  };
}

function buildAirQualityFixture(): RawAirQuality {
  return {
    current: { european_aqi: 35, pm2_5: 12.5, pm10: 22, ozone: 45, nitrogen_dioxide: 18 },
    current_units: { pm2_5: 'μg/m³', pm10: 'μg/m³', ozone: 'μg/m³', nitrogen_dioxide: 'μg/m³' },
  };
}

const QUERY = { latitude: -23.5505, longitude: -46.6333, name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil' };

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('searchCities', () => {
  it('forwards the term and returns normalized results (#17)', async () => {
    // Arrange
    const expected = [{ name: 'London', admin1: null, country: null, country_code: null, latitude: 51, longitude: 0, timezone: null }];
    mockedSearch.mockResolvedValue(expected);

    // Act
    const results = await searchCities('London');

    // Assert
    expect(mockedSearch).toHaveBeenCalledWith('London', 6);
    expect(results).toEqual(expected);
  });

  it('returns [] for a term without matches (#18)', async () => {
    // Arrange
    mockedSearch.mockResolvedValue([]);

    // Act
    const results = await searchCities('xyzxyz');

    // Assert
    expect(results).toEqual([]);
  });
});

describe('getWeather', () => {
  it('aggregates Forecast + Air Quality into WeatherPayload with °C/km/h units (#19)', async () => {
    // Arrange
    mockedForecast.mockResolvedValue(buildForecastFixture());
    mockedAirQuality.mockResolvedValue(buildAirQualityFixture());

    // Act
    const payload = await getWeather(QUERY);

    // Assert
    expect(payload.units).toEqual({ temperature: '°C', wind_speed: 'km/h' });
    expect(payload.current.temperature).toBe(24);
    expect(payload.extras.air?.european_aqi).toBe(35);
  });

  it('selects the next 24 hours starting at current.time (#20)', async () => {
    // Arrange
    mockedForecast.mockResolvedValue(buildForecastFixture());
    mockedAirQuality.mockResolvedValue(null);

    // Act
    const payload = await getWeather(QUERY);

    // Assert
    expect(payload.hourly).toHaveLength(24);
    expect(payload.hourly[0].time).toBe('2026-06-23T14:00');
  });

  it('fills daily with 7 days (max/min/condition/UV/sun) (#21)', async () => {
    // Arrange
    mockedForecast.mockResolvedValue(buildForecastFixture());
    mockedAirQuality.mockResolvedValue(null);

    // Act
    const payload = await getWeather(QUERY);

    // Assert
    expect(payload.daily).toHaveLength(7);
    expect(payload.daily[0]).toMatchObject({ temp_max: 28, temp_min: 18, weather_code: 2, uv_index_max: 6.2 });
    expect(payload.daily[0].sunrise).toBe('2026-06-23T06:45');
  });

  it('enriches location with name/admin1/country from the query (#22)', async () => {
    // Arrange
    mockedForecast.mockResolvedValue(buildForecastFixture());
    mockedAirQuality.mockResolvedValue(null);

    // Act
    const payload = await getWeather(QUERY);

    // Assert
    expect(payload.location).toMatchObject({ name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil' });
  });

  it('sets extras.air = null and keeps the payload when Air Quality is unavailable (#23)', async () => {
    // Arrange
    mockedForecast.mockResolvedValue(buildForecastFixture());
    mockedAirQuality.mockResolvedValue(null);

    // Act
    const payload = await getWeather(QUERY);

    // Assert
    expect(payload.extras.air).toBeNull();
    expect(payload.current).toBeDefined();
  });

  it('propagates upstream_unavailable when Forecast fails (#24)', async () => {
    // Arrange
    mockedForecast.mockRejectedValue(new WeatherError('upstream_unavailable', 'down'));
    mockedAirQuality.mockResolvedValue(null);

    // Act & Assert
    await expect(getWeather(QUERY)).rejects.toMatchObject({ code: 'upstream_unavailable' });
  });

  it('computes wind_cardinal from wind_direction (#25)', async () => {
    // Arrange
    mockedForecast.mockResolvedValue(buildForecastFixture());
    mockedAirQuality.mockResolvedValue(null);

    // Act
    const payload = await getWeather(QUERY);

    // Assert
    expect(payload.current.wind_direction).toBe(180);
    expect(payload.current.wind_cardinal).toBe('S');
  });

  it('applies PT-BR condition/UV/AQI labels via weather-codes (#26)', async () => {
    // Arrange
    mockedForecast.mockResolvedValue(buildForecastFixture());
    mockedAirQuality.mockResolvedValue(buildAirQualityFixture());

    // Act
    const payload = await getWeather(QUERY);

    // Assert
    expect(payload.current.condition).toEqual({ code: 2, label: 'Parcialmente nublado', group: 'cloudy' });
    expect(payload.extras.uv).toEqual({ value: 6.2, label: 'Alto' });
    expect(payload.extras.air?.category.label).toBe('Razoável');
  });
});
