/**
 * Weather service backed by the free Open-Meteo APIs.
 *
 * - Geocoding API: converts a city name into coordinates.
 *   https://geocoding-api.open-meteo.com/v1/search
 * - Forecast API: returns the current weather for a set of coordinates.
 *   https://api.open-meteo.com/v1/forecast
 *
 * Note: Open-Meteo's geocoding endpoint only searches *by name*; it does not
 * support reverse geocoding. When the caller already has coordinates (e.g. from
 * the browser's Geolocation API) we therefore query the forecast API directly
 * instead of trying to resolve a city name from the coordinates.
 */

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/** Abort external calls that hang for too long. */
const REQUEST_TIMEOUT_MS = 10_000;

export interface WeatherLocation {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  time: string;
  units: {
    temperature: string;
    windSpeed: string;
    humidity: string;
  };
}

export interface WeatherResult {
  location: WeatherLocation;
  current: CurrentWeather;
}

/** Raised for predictable, user-facing failures (bad input, not found, …). */
export class WeatherError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'WeatherError';
  }
}

interface GeocodingResult {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  timezone?: string;
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
  };
  current_units?: {
    temperature_2m?: string;
    wind_speed_10m?: string;
    relative_humidity_2m?: string;
  };
}

/** WMO weather interpretation codes → human readable description (pt-BR). */
const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina com geada',
  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  56: 'Garoa congelante leve',
  57: 'Garoa congelante intensa',
  61: 'Chuva leve',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  66: 'Chuva congelante leve',
  67: 'Chuva congelante forte',
  71: 'Neve leve',
  73: 'Neve moderada',
  75: 'Neve forte',
  77: 'Grãos de neve',
  80: 'Pancadas de chuva leves',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva fortes',
  85: 'Pancadas de neve leves',
  86: 'Pancadas de neve fortes',
  95: 'Tempestade',
  96: 'Tempestade com granizo leve',
  99: 'Tempestade com granizo forte',
};

function getWeatherDescription(code: number): string {
  return WEATHER_DESCRIPTIONS[code] ?? 'Condição desconhecida';
}

async function fetchJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new WeatherError('O serviço de clima demorou para responder', 504);
    }
    throw new WeatherError('Não foi possível conectar ao serviço de clima', 502);
  }

  if (!response.ok) {
    throw new WeatherError(
      `Falha ao consultar o serviço de clima (${response.status})`,
      502,
    );
  }

  return response.json() as Promise<T>;
}

/** Resolve a city name into a geographic location via the geocoding API. */
async function geocodeByCity(city: string): Promise<WeatherLocation> {
  const params = new URLSearchParams({
    name: city,
    count: '1',
    language: 'pt',
    format: 'json',
  });

  const data = await fetchJson<GeocodingResponse>(`${GEOCODING_URL}?${params}`);
  const result = data.results?.[0];

  if (!result) {
    throw new WeatherError(`Cidade "${city}" não encontrada`, 404);
  }

  return {
    name: result.name,
    country: result.country,
    admin1: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

/** Fetch the current weather for a location using the forecast API. */
async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<{ current: CurrentWeather; timezone?: string }> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'weather_code',
      'is_day',
    ].join(','),
    timezone: 'auto',
  });

  const data = await fetchJson<ForecastResponse>(`${FORECAST_URL}?${params}`);

  if (!data.current) {
    throw new WeatherError('Dados meteorológicos indisponíveis', 502);
  }

  const { current, current_units: units } = data;

  return {
    timezone: data.timezone,
    current: {
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      weatherDescription: getWeatherDescription(current.weather_code),
      isDay: current.is_day === 1,
      time: current.time,
      units: {
        temperature: units?.temperature_2m ?? '°C',
        windSpeed: units?.wind_speed_10m ?? 'km/h',
        humidity: units?.relative_humidity_2m ?? '%',
      },
    },
  };
}

/** Get the current weather for a city by name. */
export async function getWeatherByCity(city: string): Promise<WeatherResult> {
  const location = await geocodeByCity(city);
  const { current, timezone } = await fetchCurrentWeather(
    location.latitude,
    location.longitude,
  );

  return {
    location: { ...location, timezone: location.timezone ?? timezone },
    current,
  };
}

/** Get the current weather for raw coordinates (e.g. browser geolocation). */
export async function getWeatherByCoordinates(
  latitude: number,
  longitude: number,
): Promise<WeatherResult> {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new WeatherError('Coordenadas inválidas', 400);
  }

  const { current, timezone } = await fetchCurrentWeather(latitude, longitude);

  return {
    location: {
      name: 'Localização atual',
      latitude,
      longitude,
      timezone,
    },
    current,
  };
}
