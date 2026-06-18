import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchWeatherByCity } from './weatherService';

describe('fetchWeatherByCity', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns weather data when API succeeds', async () => {
    // Arrange
    const weatherPayload = {
      location: { name: 'Lisbon', country: 'Portugal', region: null, latitude: 1, longitude: 1, timezone: 'UTC' },
      current: {
        time: '2026-06-18T12:00',
        temperature: 20,
        apparentTemperature: 21,
        relativeHumidity: 40,
        precipitation: 0,
        weatherCode: 0,
        windSpeed: 5,
        windDirection: 90,
        isDay: true,
      },
      units: {
        temperature: '°C',
        apparentTemperature: '°C',
        relativeHumidity: '%',
        precipitation: 'mm',
        windSpeed: 'km/h',
        windDirection: '°',
      },
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(weatherPayload),
      }),
    );

    // Act
    const result = await fetchWeatherByCity('Lisbon');

    // Assert
    expect(result.data).toEqual(weatherPayload);
    expect(result.error).toBeNull();
  });

  it('returns error message when API fails', async () => {
    // Arrange
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'City not found' }),
      }),
    );

    // Act
    const result = await fetchWeatherByCity('Unknown');

    // Assert
    expect(result.data).toBeNull();
    expect(result.error).toBe('City not found');
  });
});
