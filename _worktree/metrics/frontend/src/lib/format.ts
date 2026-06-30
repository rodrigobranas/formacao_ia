import type { UnitSystem } from '@/types/unit-system'
import {
  convertTemperature,
  convertWind,
  convertPrecipitation,
  convertPressure,
  windUnitLabel,
  precipitationUnitLabel,
  pressureUnitLabel,
} from './units'

const PLACEHOLDER = '—'

type MeasureKind = 'wind' | 'precip' | 'pressure'

const MEASURE_CONVERTERS: Record<MeasureKind, (value: number | null, system: UnitSystem) => number | null> = {
  wind: convertWind,
  precip: convertPrecipitation,
  pressure: convertPressure,
}

const MEASURE_LABELS: Record<MeasureKind, (system: UnitSystem) => string> = {
  wind: windUnitLabel,
  precip: precipitationUnitLabel,
  pressure: pressureUnitLabel,
}

export function roundTemperature(celsius: number | null): string {
  if (celsius === null || Number.isNaN(celsius)) {
    return PLACEHOLDER
  }
  return String(Math.round(celsius))
}

export function formatTemperature(celsius: number | null, system: UnitSystem = 'metric'): string {
  if (celsius === null || Number.isNaN(celsius)) {
    return PLACEHOLDER
  }
  // Display temperatures use whole-degree semantics: round the Celsius reading
  // first, then convert so the imperial label matches the rounded metric value.
  const converted = convertTemperature(Math.round(celsius), system)
  return converted === null ? PLACEHOLDER : `${converted}°`
}

export function formatTime(iso: string | null): string {
  if (!iso || iso.length < 16) {
    return PLACEHOLDER
  }
  return iso.slice(11, 16)
}

const CARDINALS = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO']

export function formatCardinal(degrees: number | null): string {
  if (degrees === null || Number.isNaN(degrees)) {
    return PLACEHOLDER
  }
  const index = Math.round((degrees % 360) / 45)
  return CARDINALS[((index % 8) + 8) % 8]
}

export function formatPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return PLACEHOLDER
  }
  return `${Math.round(value)}%`
}

export function formatWeekday(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) {
    return PLACEHOLDER
  }
  const label = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatMeasure(
  value: number | null,
  unit: string,
  system: UnitSystem = 'metric',
  kind?: MeasureKind,
): string {
  if (value === null || Number.isNaN(value)) {
    return PLACEHOLDER
  }
  if (system === 'imperial' && kind) {
    const converted = MEASURE_CONVERTERS[kind](value, system)
    return converted === null ? PLACEHOLDER : `${converted} ${MEASURE_LABELS[kind](system)}`
  }
  return `${Math.round(value)} ${unit}`
}
