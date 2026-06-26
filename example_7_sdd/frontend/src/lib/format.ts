const PLACEHOLDER = '—'

export function roundTemperature(celsius: number | null): string {
  if (celsius === null || Number.isNaN(celsius)) {
    return PLACEHOLDER
  }
  return String(Math.round(celsius))
}

export function formatTemperature(celsius: number | null): string {
  const rounded = roundTemperature(celsius)
  return rounded === PLACEHOLDER ? PLACEHOLDER : `${rounded}°`
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

export function formatMeasure(value: number | null, unit: string): string {
  if (value === null || Number.isNaN(value)) {
    return PLACEHOLDER
  }
  return `${Math.round(value)} ${unit}`
}
