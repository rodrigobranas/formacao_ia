import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useWeather } from './useWeather';

vi.mock('@/services/weatherService', () => ({
  fetchWeatherByCity: vi.fn(),
  fetchWeatherByCoordinates: vi.fn(),
}));

import { fetchWeatherByCity } from '@/services/weatherService';

describe('useWeather', () => {
  beforeEach(() => {
    vi.mocked(fetchWeatherByCity).mockResolvedValue({
      data: {
        location: {
          name: 'São Paulo',
          country: 'Brazil',
          region: 'São Paulo',
          latitude: -23.55,
          longitude: -46.63,
          timezone: 'America/Sao_Paulo',
        },
        current: {
          time: '2026-06-18T12:00',
          temperature: 22,
          apparentTemperature: 24,
          relativeHumidity: 60,
          precipitation: 0,
          weatherCode: 0,
          windSpeed: 10,
          windDirection: 180,
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
      },
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads default city weather on mount', async () => {
    // Arrange & Act
    const { result } = renderHook(() => useWeather());

    // Assert
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
    expect(result.current.weather?.location.name).toBe('São Paulo');
  });

  it('sets error when searching with empty city', async () => {
    // Arrange
    const { result } = renderHook(() => useWeather());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    // Act
    act(() => {
      result.current.searchByCity('');
    });

    // Assert
    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toBe('Informe uma cidade.');
  });
});
