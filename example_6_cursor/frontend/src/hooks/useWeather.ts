import { useCallback, useEffect, useState } from 'react';
import {
  fetchWeatherByCity,
  fetchWeatherByCoordinates,
} from '@/services/weatherService';
import type { WeatherResponse } from '@/types/weather-response';
import type { WeatherStatus } from '@/types/weather-status';

const DEFAULT_CITY = 'São Paulo';

export function useWeather() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const loadWeatherByCity = useCallback(async (cityName: string) => {
    setStatus('loading');
    setErrorMessage('');

    const result = await fetchWeatherByCity(cityName);

    if (result.error) {
      setStatus('error');
      setErrorMessage(result.error);
      return;
    }

    setWeather(result.data);
    setStatus('success');
  }, []);

  const loadWeatherByCoordinates = useCallback(async (input: {
    latitude: number;
    longitude: number;
  }) => {
    setStatus('loading');
    setErrorMessage('');

    const result = await fetchWeatherByCoordinates(input);

    if (result.error) {
      setStatus('error');
      setErrorMessage(result.error);
      return;
    }

    setWeather(result.data);
    setStatus('success');
  }, []);

  const searchByCity = useCallback((cityName: string) => {
    if (cityName.length === 0) {
      setStatus('error');
      setErrorMessage('Informe uma cidade.');
      return;
    }

    void loadWeatherByCity(cityName);
  }, [loadWeatherByCity]);

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not available in this browser.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void loadWeatherByCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setStatus('error');
        setErrorMessage('Could not get your location.');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }, [loadWeatherByCoordinates]);

  useEffect(() => {
    void loadWeatherByCity(DEFAULT_CITY);
  }, [loadWeatherByCity]);

  return {
    city,
    setCity,
    weather,
    status,
    errorMessage,
    searchByCity,
    requestUserLocation,
  };
}
