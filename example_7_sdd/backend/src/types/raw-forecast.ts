export type RawForecast = {
  latitude: number;
  longitude: number;
  timezone: string | null;
  current: Record<string, number | string>;
  current_units: Record<string, string>;
  hourly: Record<string, Array<number | string>>;
  hourly_units: Record<string, string>;
  daily: Record<string, Array<number | string>>;
  daily_units: Record<string, string>;
};
