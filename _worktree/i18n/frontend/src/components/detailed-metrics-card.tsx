import { useMemo, type ReactNode } from 'react'
import { Thermometer, Wind, Droplets, Gauge, Cloud, CloudRain, Sun } from 'lucide-react'
import type { CurrentWeather } from '@/types/current-weather'
import { formatTemperature, formatPercent, formatMeasure, formatCardinal } from '@/lib/format'
import { translateApiLabel } from '@/i18n/translate-api-label'
import { useTranslation } from 'react-i18next'

type Uv = { value: number; label: string } | null

function colorForUvValue(value: number | null): string {
  if (value === null || Number.isNaN(value)) return 'var(--wx-muted)'
  if (value < 3) return 'var(--good)'
  if (value < 6) return 'var(--mod)'
  if (value < 8) return 'var(--poor)'
  if (value < 11) return 'var(--bad)'
  return 'var(--vbad)'
}

type Metric = { label: string; icon: ReactNode; value: string; sub: string }

function buildMetrics(current: CurrentWeather, windUnit: string, locale: string, t: (key: string, options?: Record<string, string>) => string): Metric[] {
  return [
    { label: t('metrics.feelsLike'), icon: <Thermometer aria-hidden="true" />, value: formatTemperature(current.apparent_temperature), sub: t('metrics.real', { value: formatTemperature(current.temperature) }) },
    { label: t('metrics.wind'), icon: <Wind aria-hidden="true" />, value: formatMeasure(current.wind_speed, windUnit), sub: formatCardinal(current.wind_direction, locale) },
    { label: t('metrics.humidity'), icon: <Droplets aria-hidden="true" />, value: formatPercent(current.humidity), sub: t('metrics.relativeHumidity') },
    { label: t('metrics.pressure'), icon: <Gauge aria-hidden="true" />, value: formatMeasure(current.pressure, 'hPa'), sub: t('metrics.seaLevel') },
    { label: t('metrics.clouds'), icon: <Cloud aria-hidden="true" />, value: formatPercent(current.cloud_cover), sub: t('metrics.coverage') },
    { label: t('metrics.precipitation'), icon: <CloudRain aria-hidden="true" />, value: formatMeasure(current.precipitation, 'mm'), sub: t('metrics.nowSub') },
    { label: t('metrics.gusts'), icon: <Wind aria-hidden="true" />, value: formatMeasure(current.wind_gusts, windUnit), sub: t('metrics.windPeak') },
  ]
}

function MetricCell({ label, icon, value, sub }: Metric) {
  return (
    <div className="wx-metric">
      <div className="ml">{icon}{label}</div>
      <div className="mv">{value}</div>
      <div className="mx">{sub}</div>
    </div>
  )
}

function UvCell({ uv }: { uv: Uv }) {
  const { t } = useTranslation()
  const color = useMemo(() => colorForUvValue(uv?.value ?? null), [uv])
  const pct = useMemo(() => (uv ? Math.min(100, (uv.value / 11) * 100) : 0), [uv])
  const label = uv ? translateApiLabel(uv.label, t) : '—'

  return (
    <div className="wx-metric">
      <div className="ml"><Sun aria-hidden="true" />{t('metrics.uvIndex')}</div>
      <div className="mv">{uv ? Math.round(uv.value) : '—'}<small style={{ color }}>{label}</small></div>
      <div className="track"><i style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  )
}

type DetailedMetricsCardProps = {
  current: CurrentWeather
  uv: Uv
  windUnit: string
}

export function DetailedMetricsCard({ current, uv, windUnit }: DetailedMetricsCardProps) {
  const { t, i18n } = useTranslation()
  const metrics = useMemo(() => buildMetrics(current, windUnit, i18n.language, t), [current, windUnit, i18n.language, t])

  return (
    <section className="wx-card" aria-label={t('metrics.detailsTitle')}>
      <div className="wx-card-h">
        <Gauge className="ic" aria-hidden="true" />
        <h3>{t('metrics.detailsTitle')}</h3>
      </div>
      <div className="wx-metrics">
        {metrics.map((metric) => (
          <MetricCell key={metric.label} label={metric.label} icon={metric.icon} value={metric.value} sub={metric.sub} />
        ))}
        <UvCell uv={uv} />
      </div>
    </section>
  )
}
