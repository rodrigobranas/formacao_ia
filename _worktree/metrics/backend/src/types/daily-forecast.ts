export type DailyForecast = {
  date: string;
  weather_code: number;
  temp_min: number;
  temp_max: number;
  precipitation_probability_max: number;
  sunrise: string;
  sunset: string;
  uv_index_max: number;
};
