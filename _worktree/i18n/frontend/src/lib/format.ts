const PLACEHOLDER = '—'
type FormatLocale = 'pt-BR' | 'en'

function normalizeLocale(locale: string | undefined): FormatLocale {
  return locale === 'en' ? 'en' : 'pt-BR'
}

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

export function formatTime(iso: string | null, locale: string = 'pt-BR'): string {
  if (!iso) {
    return PLACEHOLDER
  }
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return PLACEHOLDER
  }
  const appLocale = normalizeLocale(locale)
  return new Intl.DateTimeFormat(appLocale, {
    hour: appLocale === 'pt-BR' ? '2-digit' : 'numeric',
    minute: '2-digit',
  }).format(date)
}

const CARDINALS: Record<FormatLocale, string[]> = {
  'pt-BR': ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'],
  en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
}

export function formatCardinal(degrees: number | null, locale: string = 'pt-BR'): string {
  if (degrees === null || Number.isNaN(degrees)) {
    return PLACEHOLDER
  }
  const index = Math.round((degrees % 360) / 45)
  return CARDINALS[normalizeLocale(locale)][((index % 8) + 8) % 8]
}

export function formatPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return PLACEHOLDER
  }
  return `${Math.round(value)}%`
}

export function formatWeekday(isoDate: string, locale: string = 'pt-BR'): string {
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) {
    return PLACEHOLDER
  }
  const label = new Intl.DateTimeFormat(normalizeLocale(locale), { weekday: 'short' })
    .format(date)
    .replace('.', '')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatMeasure(value: number | null, unit: string): string {
  if (value === null || Number.isNaN(value)) {
    return PLACEHOLDER
  }
  return `${Math.round(value)} ${unit}`
}
