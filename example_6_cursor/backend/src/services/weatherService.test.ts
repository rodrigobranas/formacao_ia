import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildWeatherReport } from './weatherService';
import { HttpError } from '../types/http-error';

vi.mock('../data/openMeteoClient', () => ({
  findLocationByCity: vi.fn(),
  fetchForecast: vi.fn(),
}));

import { findLocationByCity, fetchForecast } from '../data/openMeteoClient';

const mockForecast = {
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-06-18T12:00',
    temperature_2m: 22,
    relative_humidity_2m: 60,
    apparent_temperature: 24,
    is_day: 1,
    precipitation: 0,
    weather_code: 0,
    wind_speed_10m: 10,
    wind_direction_10m: 180,
  },
  current_units: {
    temperature_2m: '°C',
    relative_humidity_2m: '%',
    apparent_temperature: '°C',
    precipitation: 'mm',
    wind_speed_10m: 'km/h',
    wind_direction_10m: '°',
  },
};

describe('buildWeatherReport', () => {
  beforeEach(() => {
    vi.mocked(findLocationByCity).mockResolvedValue({
      id: 1,
      name: 'São Paulo',
      latitude: -23.55,
      longitude: -46.63,
      country: 'Brazil',
      admin1: 'São Paulo',
      timezone: 'America/Sao_Paulo',
    });
    vi.mocked(fetchForecast).mockResolvedValue(mockForecast);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns weather report for a valid city', async () => {
    // Act
    const report = await buildWeatherReport({ city: 'São Paulo' });

    // Assert
    expect(report.location.name).toBe('São Paulo');
    expect(report.current.temperature).toBe(22);
    expect(report.units.temperature).toBe('°C');
  });

  it('returns weather report for coordinates without geocoding', async () => {
    // Act
    const report = await buildWeatherReport({
      latitude: '-23.55',
      longitude: '-46.63',
    });

    // Assert
    expect(findLocationByCity).not.toHaveBeenCalled();
    expect(report.location.name).toBe('Your location');
  });

  it('throws when city and coordinates are missing', async () => {
    // Act & Assert
    await expect(buildWeatherReport({})).rejects.toThrow(HttpError);
  });
});
