export type WeatherErrorCode =
  | 'invalid_request'
  | 'city_not_found'
  | 'upstream_unavailable';

export class WeatherError extends Error {
  readonly code: WeatherErrorCode;

  constructor(code: WeatherErrorCode, message: string) {
    super(message);
    this.name = 'WeatherError';
    this.code = code;
  }
}
