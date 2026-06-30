import type { WeatherGroup } from '@/types/weather-group'

type GroupRange = { from: number; to: number; group: WeatherGroup }

// Mirrors the backend WMO grouping (services/weather-codes.ts).
const GROUP_RANGES: GroupRange[] = [
  { from: 0, to: 1, group: 'clear' },
  { from: 2, to: 3, group: 'cloudy' },
  { from: 45, to: 48, group: 'fog' },
  { from: 51, to: 57, group: 'drizzle' },
  { from: 61, to: 67, group: 'rain' },
  { from: 71, to: 77, group: 'snow' },
  { from: 80, to: 82, group: 'rain' },
  { from: 85, to: 86, group: 'snow' },
  { from: 95, to: 99, group: 'thunder' },
]

export function groupForCode(code: number): WeatherGroup {
  const match = GROUP_RANGES.find((range) => code >= range.from && code <= range.to)
  return match ? match.group : 'cloudy'
}

export function labelKeyForCode(code: number): string {
  return `daily.${groupForCode(code)}`
}
