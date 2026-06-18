export interface ForecastDay {
  date: string;
  maxTemperature: number;
  minTemperature: number;
  weatherCode: number;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
  isDay: boolean;
  time: string;
}

export interface WeatherData {
  city?: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export interface WeatherError {
  error: string;
  message: string;
}
