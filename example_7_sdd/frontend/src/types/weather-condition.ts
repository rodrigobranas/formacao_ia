import type { WeatherGroup } from './weather-group'

export type WeatherCondition = {
  code: number
  label: string
  group: WeatherGroup
}
