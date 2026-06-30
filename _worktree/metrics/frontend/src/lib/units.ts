import type { UnitSystem } from '@/types/unit-system'

const WIND_KMH_TO_MPH = 0.621371
const PRECIPITATION_MM_TO_IN = 0.0393701
const PRESSURE_HPA_TO_INHG = 0.02953

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function convertTemperature(celsius: number | null, system: UnitSystem): number | null {
  if (celsius === null || Number.isNaN(celsius)) {
    return null
  }
  if (system === 'metric') {
    return celsius
  }
  return Math.round((celsius * 9) / 5 + 32)
}

export function convertWind(kmh: number | null, system: UnitSystem): number | null {
  if (kmh === null || Number.isNaN(kmh)) {
    return null
  }
  if (system === 'metric') {
    return kmh
  }
  return Math.round(kmh * WIND_KMH_TO_MPH)
}

export function convertPrecipitation(mm: number | null, system: UnitSystem): number | null {
  if (mm === null || Number.isNaN(mm)) {
    return null
  }
  if (system === 'metric') {
    return mm
  }
  return roundTo(mm * PRECIPITATION_MM_TO_IN, 2)
}

export function convertPressure(hpa: number | null, system: UnitSystem): number | null {
  if (hpa === null || Number.isNaN(hpa)) {
    return null
  }
  if (system === 'metric') {
    return hpa
  }
  return roundTo(hpa * PRESSURE_HPA_TO_INHG, 1)
}

const TEMPERATURE_LABELS: Record<UnitSystem, string> = { metric: '°', imperial: '°' }
const WIND_LABELS: Record<UnitSystem, string> = { metric: 'km/h', imperial: 'mph' }
const PRECIPITATION_LABELS: Record<UnitSystem, string> = { metric: 'mm', imperial: 'in' }
const PRESSURE_LABELS: Record<UnitSystem, string> = { metric: 'hPa', imperial: 'inHg' }

export function temperatureUnitLabel(system: UnitSystem): string {
  return TEMPERATURE_LABELS[system]
}

export function windUnitLabel(system: UnitSystem): string {
  return WIND_LABELS[system]
}

export function precipitationUnitLabel(system: UnitSystem): string {
  return PRECIPITATION_LABELS[system]
}

export function pressureUnitLabel(system: UnitSystem): string {
  return PRESSURE_LABELS[system]
}
