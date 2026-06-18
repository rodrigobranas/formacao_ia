import type { WeatherResponse } from '@/types/weather-response';

const API_BASE_URL = 'http://localhost:3000';

type WeatherFetchResult =
  | { data: WeatherResponse; error: null }
  | { data: null; error: string };

async function fetchWeather(params: URLSearchParams): Promise<WeatherFetchResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/weather?${params.toString()}`);
    const payload = await response.json();

    if (!response.ok) {
      return { data: null, error: payload.message ?? 'Could not fetch weather data.' };
    }

    return { data: payload as WeatherResponse, error: null };
  } catch {
    return { data: null, error: 'Could not fetch weather data.' };
  }
}

export async function fetchWeatherByCity(city: string): Promise<WeatherFetchResult> {
  return fetchWeather(new URLSearchParams({ city }));
}

export async function fetchWeatherByCoordinates(input: {
  latitude: number;
  longitude: number;
}): Promise<WeatherFetchResult> {
  return fetchWeather(
    new URLSearchParams({
      latitude: String(input.latitude),
      longitude: String(input.longitude),
    }),
  );
}
