import type { WeatherCondition } from './weather-condition';

export type CurrentWeather = {
  time: string;
  temperature: number;
  apparent_temperature: number;
  condition: WeatherCondition;
  is_day: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  wind_cardinal: string;
  wind_gusts: number;
  pressure: number;
  cloud_cover: number;
  precipitation: number;
};
