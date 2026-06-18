import type { WeatherCurrent } from '@/types/weather-current';
import type { WeatherLocation } from '@/types/weather-location';
import type { WeatherUnits } from '@/types/weather-units';

export type WeatherResponse = {
  location: WeatherLocation;
  current: WeatherCurrent;
  units: WeatherUnits;
};
