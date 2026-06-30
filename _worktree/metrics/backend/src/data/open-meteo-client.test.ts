import { describe, it, expect, vi, afterEach } from 'vitest';
import { searchCities, fetchForecast, fetchAirQuality } from './open-meteo-client';
import { WeatherError } from '../types/weather-error';

function stubFetchResolving(body: unknown, ok = true, status = 200): ReturnType<typeof vi.fn> {
  const mock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

function readCalledUrl(mock: ReturnType<typeof vi.fn>): string {
  return decodeURIComponent(String(mock.mock.calls[0][0]));
}

const SAO_PAULO = { latitude: -23.5505, longitude: -46.6333 };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('builds the URL with name, count, language=pt and format=json (#1)', async () => {
    // Arrange
    const mock = stubFetchResolving({ results: [] });

    // Act
    await searchCities('London', 6);

    // Assert
    const url = readCalledUrl(mock);
    expect(url).toContain('name=London');
    expect(url).toContain('count=6');
    expect(url).toContain('language=pt');
    expect(url).toContain('format=json');
  });

  it('parses results[] and normalizes missing admin1/country/country_code to null (#2)', async () => {
    // Arrange
    stubFetchResolving({
      results: [{ name: 'Atlantis', latitude: 1, longitude: 2 }],
    });

    // Act
    const results = await searchCities('Atlantis', 6);

    // Assert
    expect(results).toEqual([
      {
        name: 'Atlantis',
        admin1: null,
        country: null,
        country_code: null,
        latitude: 1,
        longitude: 2,
        timezone: null,
      },
    ]);
  });

  it('returns [] when Open-Meteo responds without results (#3)', async () => {
    // Arrange
    stubFetchResolving({ generationtime_ms: 0.1 });

    // Act
    const results = await searchCities('xyzxyz', 6);

    // Assert
    expect(results).toEqual([]);
  });
});

describe('fetchForecast', () => {
  it('builds the URL with current/hourly/daily and fixed units (#4)', async () => {
    // Arrange
    const mock = stubFetchResolving({ current: {}, hourly: {}, daily: {} });

    // Act
    await fetchForecast(SAO_PAULO);

    // Assert
    const url = readCalledUrl(mock);
    expect(url).toContain('current=');
    expect(url).toContain('hourly=');
    expect(url).toContain('daily=');
    expect(url).toContain('temperature_unit=celsius');
    expect(url).toContain('wind_speed_unit=kmh');
    expect(url).toContain('timezone=auto');
    expect(url).toContain('forecast_days=7');
  });

  it('parses current/hourly/daily and their _units (#5)', async () => {
    // Arrange
    const body = {
      current: { temperature_2m: 24 },
      current_units: { temperature_2m: '°C' },
      hourly: { time: ['2026-06-23T14:00'], temperature_2m: [24] },
      hourly_units: { temperature_2m: '°C' },
      daily: { time: ['2026-06-23'], temperature_2m_max: [28] },
      daily_units: { temperature_2m_max: '°C' },
    };
    stubFetchResolving(body);

    // Act
    const forecast = await fetchForecast(SAO_PAULO);

    // Assert
    expect(forecast.current.temperature_2m).toBe(24);
    expect(forecast.hourly.temperature_2m).toEqual([24]);
    expect(forecast.daily_units.temperature_2m_max).toBe('°C');
  });

  it('throws upstream_unavailable on HTTP 500 (#6)', async () => {
    // Arrange
    stubFetchResolving({}, false, 500);

    // Act & Assert
    await expect(fetchForecast(SAO_PAULO)).rejects.toMatchObject({
      code: 'upstream_unavailable',
    });
  });

  it('throws upstream_unavailable when body is { error: true, reason } (#7)', async () => {
    // Arrange
    stubFetchResolving({ error: true, reason: 'Invalid coordinates' });

    // Act & Assert
    await expect(fetchForecast(SAO_PAULO)).rejects.toBeInstanceOf(WeatherError);
  });

  it('throws upstream_unavailable on timeout/abort (#8)', async () => {
    // Arrange
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')));

    // Act & Assert
    await expect(fetchForecast(SAO_PAULO)).rejects.toMatchObject({
      code: 'upstream_unavailable',
    });
  });
});

describe('fetchAirQuality', () => {
  it('builds the URL with the EAQI pollutant list and timezone=auto (#9)', async () => {
    // Arrange
    const mock = stubFetchResolving({ current: {}, current_units: {} });

    // Act
    await fetchAirQuality(SAO_PAULO);

    // Assert
    const url = readCalledUrl(mock);
    expect(url).toContain('european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide');
    expect(url).toContain('timezone=auto');
  });

  it('returns null (without propagating) when the upstream fails (#10)', async () => {
    // Arrange
    stubFetchResolving({}, false, 500);

    // Act
    const result = await fetchAirQuality(SAO_PAULO);

    // Assert
    expect(result).toBeNull();
  });
});
