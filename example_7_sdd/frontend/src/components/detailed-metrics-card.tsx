import { useMemo, type ReactNode } from 'react'
import { Thermometer, Wind, Droplets, Gauge, Cloud, CloudRain, Sun } from 'lucide-react'
import type { CurrentWeather } from '@/types/current-weather'
import { formatTemperature, formatPercent, formatMeasure, formatCardinal } from '@/lib/format'

type Uv = { value: number; label: string } | null

const UV_COLOR: Record<string, string> = {
  Baixo: 'var(--good)',
  Moderado: 'var(--mod)',
  Alto: 'var(--poor)',
  'Muito alto': 'var(--bad)',
  Extremo: 'var(--vbad)',
}

type Metric = { label: string; icon: ReactNode; value: string; sub: string }

function buildMetrics(current: CurrentWeather, windUnit: string): Metric[] {
  return [
    { label: 'Sensação', icon: <Thermometer aria-hidden="true" />, value: formatTemperature(current.apparent_temperature), sub: `Real ${formatTemperature(current.temperature)}` },
    { label: 'Vento', icon: <Wind aria-hidden="true" />, value: formatMeasure(current.wind_speed, windUnit), sub: formatCardinal(current.wind_direction) },
    { label: 'Umidade', icon: <Droplets aria-hidden="true" />, value: formatPercent(current.humidity), sub: 'umidade relativa' },
    { label: 'Pressão', icon: <Gauge aria-hidden="true" />, value: formatMeasure(current.pressure, 'hPa'), sub: 'nível do mar' },
    { label: 'Nuvens', icon: <Cloud aria-hidden="true" />, value: formatPercent(current.cloud_cover), sub: 'cobertura' },
    { label: 'Precipitação', icon: <CloudRain aria-hidden="true" />, value: formatMeasure(current.precipitation, 'mm'), sub: 'agora' },
    { label: 'Rajadas', icon: <Wind aria-hidden="true" />, value: formatMeasure(current.wind_gusts, windUnit), sub: 'pico de vento' },
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
  const color = useMemo(
    () => (uv ? UV_COLOR[uv.label] ?? 'var(--wx-muted)' : 'var(--wx-muted)'),
    [uv],
  )
  const pct = useMemo(() => (uv ? Math.min(100, (uv.value / 11) * 100) : 0), [uv])
  return (
    <div className="wx-metric">
      <div className="ml"><Sun aria-hidden="true" />Índice UV</div>
      <div className="mv">{uv ? Math.round(uv.value) : '—'}<small style={{ color }}>{uv ? uv.label : '—'}</small></div>
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
  const metrics = useMemo(() => buildMetrics(current, windUnit), [current, windUnit])

  return (
    <section className="wx-card" aria-label="Condições detalhadas">
      <div className="wx-card-h">
        <Gauge className="ic" aria-hidden="true" />
        <h3>Condições detalhadas</h3>
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
