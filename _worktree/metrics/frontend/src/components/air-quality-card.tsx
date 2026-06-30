import { useMemo, type ReactNode } from 'react'
import { Wind } from 'lucide-react'
import type { AirQuality } from '@/types/air-quality'

const AQI_COLOR: Record<string, string> = {
  Boa: 'var(--good)',
  Razoável: 'var(--fair)',
  Moderada: 'var(--mod)',
  Ruim: 'var(--poor)',
  'Muito ruim': 'var(--bad)',
  Péssima: 'var(--vbad)',
}

const POLLUTANTS: Array<{ label: string; key: keyof AirQuality['pollutants'] }> = [
  { label: 'PM2.5', key: 'pm2_5' },
  { label: 'PM10', key: 'pm10' },
  { label: 'O₃', key: 'ozone' },
  { label: 'NO₂', key: 'nitrogen_dioxide' },
]

const RADIUS = 34
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function CardShell({ children }: { children: ReactNode }) {
  return (
    <section className="wx-card" aria-label="Qualidade do ar">
      <div className="wx-card-h">
        <Wind className="ic" aria-hidden="true" />
        <h3>Qualidade do ar</h3>
        <span className="meta">EAQI</span>
      </div>
      {children}
    </section>
  )
}

function AqiGauge({ value, color }: { value: number; color: string }) {
  const offset = useMemo(() => CIRCUMFERENCE * (1 - Math.min(100, value) / 100), [value])
  return (
    <div className="wx-aqi-gauge">
      <svg viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r={RADIUS} fill="none" stroke="var(--surface-3)" strokeWidth="7" />
        <circle cx="42" cy="42" r={RADIUS} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset} />
      </svg>
      <div className="val"><b>{Math.round(value)}</b><span>EAQI</span></div>
    </div>
  )
}

function AqiContent({ air }: { air: AirQuality }) {
  const color = useMemo(() => AQI_COLOR[air.category.label] ?? 'var(--wx-muted)', [air])
  return (
    <CardShell>
      <div className="wx-aqi-main">
        <AqiGauge value={air.european_aqi} color={color} />
        <div className="wx-aqi-info">
          <div className="cat" style={{ color }}>{air.category.label}</div>
          <div className="desc">{air.category.description}</div>
        </div>
      </div>
      <div className="wx-poll">
        {POLLUTANTS.map((pollutant) => (
          <div className="wx-poll-item" key={pollutant.key}>
            <span className="pl">{pollutant.label}</span>
            <span className="pv">{air.pollutants[pollutant.key] ?? '—'} µg/m³</span>
          </div>
        ))}
      </div>
    </CardShell>
  )
}

type AirQualityCardProps = {
  air: AirQuality | null
}

export function AirQualityCard({ air }: AirQualityCardProps) {
  if (!air) {
    return (
      <CardShell>
        <p className="wx-empty">Dados de qualidade do ar indisponíveis para este local.</p>
      </CardShell>
    )
  }
  return <AqiContent air={air} />
}
