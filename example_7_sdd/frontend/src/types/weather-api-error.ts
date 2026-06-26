import type { WeatherErrorCode } from './weather-error-code'

export class WeatherApiError extends Error {
  readonly code: WeatherErrorCode

  constructor(code: WeatherErrorCode, message: string) {
    super(message)
    this.name = 'WeatherApiError'
    this.code = code
  }
}
