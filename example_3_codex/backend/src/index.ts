import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';

type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

type ForecastResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  current_units: {
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    precipitation: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
  };
};

class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const fetchJson = async <T>(url: URL): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new HttpError(response.status, 'Weather provider request failed');
  }

  return response.json() as Promise<T>;
};

const parseCoordinate = (value: unknown, label: string): number => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, `${label} is required`);
  }

  const coordinate = Number(value);

  if (!Number.isFinite(coordinate)) {
    throw new HttpError(400, `${label} must be a valid number`);
  }

  return coordinate;
};

const findLocationByCity = async (city: string): Promise<GeocodingResult> => {
  const url = new URL(GEOCODING_API_URL);
  url.searchParams.set('name', city);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'pt');
  url.searchParams.set('format', 'json');

  const data = await fetchJson<GeocodingResponse>(url);
  const location = data.results?.[0];

  if (!location) {
    throw new HttpError(404, 'City not found');
  }

  return location;
};

const getForecast = async (latitude: number, longitude: number): Promise<ForecastResponse> => {
  const url = new URL(FORECAST_API_URL);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(',')
  );
  url.searchParams.set('timezone', 'auto');

  return fetchJson<ForecastResponse>(url);
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/weather', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, latitude, longitude } = req.query;
    const hasCoordinates = latitude !== undefined || longitude !== undefined;
    let location: GeocodingResult | null = null;
    let forecastLatitude: number;
    let forecastLongitude: number;

    if (hasCoordinates) {
      forecastLatitude = parseCoordinate(latitude, 'latitude');
      forecastLongitude = parseCoordinate(longitude, 'longitude');
    } else if (typeof city === 'string' && city.trim() !== '') {
      location = await findLocationByCity(city.trim());
      forecastLatitude = location.latitude;
      forecastLongitude = location.longitude;
    } else {
      throw new HttpError(400, 'city or coordinates are required');
    }

    const forecast = await getForecast(forecastLatitude, forecastLongitude);

    res.json({
      location: {
        name: location?.name ?? 'Sua localização',
        country: location?.country ?? null,
        region: location?.admin1 ?? null,
        latitude: forecast.latitude,
        longitude: forecast.longitude,
        timezone: location?.timezone ?? forecast.timezone,
      },
      current: {
        time: forecast.current.time,
        temperature: forecast.current.temperature_2m,
        apparentTemperature: forecast.current.apparent_temperature,
        relativeHumidity: forecast.current.relative_humidity_2m,
        precipitation: forecast.current.precipitation,
        weatherCode: forecast.current.weather_code,
        windSpeed: forecast.current.wind_speed_10m,
        windDirection: forecast.current.wind_direction_10m,
        isDay: forecast.current.is_day === 1,
      },
      units: {
        temperature: forecast.current_units.temperature_2m,
        apparentTemperature: forecast.current_units.apparent_temperature,
        relativeHumidity: forecast.current_units.relative_humidity_2m,
        precipitation: forecast.current_units.precipitation,
        windSpeed: forecast.current_units.wind_speed_10m,
        windDirection: forecast.current_units.wind_direction_10m,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err instanceof HttpError ? err.statusCode : 500;

  res.status(statusCode).json({ 
    error: statusCode === 500 ? 'Something went wrong!' : err.message,
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
