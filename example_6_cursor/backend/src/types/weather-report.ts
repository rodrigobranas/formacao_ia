import type { WeatherCurrent } from './weather-current';
import type { WeatherLocation } from './weather-location';
import type { WeatherUnits } from './weather-units';

export type WeatherReport = {
  location: WeatherLocation;
  current: WeatherCurrent;
  units: WeatherUnits;
};
