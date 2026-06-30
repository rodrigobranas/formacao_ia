import { useMemo, type ReactNode } from 'react'
import { Wind } from 'lucide-react'
import type { AirQuality } from '@/types/air-quality'
import { translateApiLabel } from '@/i18n/translate-api-label'
import { useTranslation } from 'react-i18next'

function colorForAqi(value: number): string {
  if (value <= 20) return 'var(--good)'
  if (value <= 40) return 'var(--fair)'
  if (value <= 60) return 'var(--mod)'
  if (value <= 80) return 'var(--poor)'
  if (value <= 100) return 'var(--bad)'
  return 'var(--vbad)'
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
  const { t } = useTranslation()

  return (
    <section className="wx-card" aria-label={t('air.title')}>
      <div className="wx-card-h">
        <Wind className="ic" aria-hidden="true" />
        <h3>{t('air.title')}</h3>
        <span className="meta">{t('air.meta')}</span>
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
  const { t } = useTranslation()
  const color = useMemo(() => colorForAqi(air.european_aqi), [air.european_aqi])
  const categoryLabel = translateApiLabel(air.category.label, t)
  const categoryDescription = translateApiLabel(air.category.description, t)

  return (
    <CardShell>
      <div className="wx-aqi-main">
        <AqiGauge value={air.european_aqi} color={color} />
        <div className="wx-aqi-info">
          <div className="cat" style={{ color }}>{categoryLabel}</div>
          <div className="desc">{categoryDescription}</div>
        </div>
      </div>
      <div className="wx-poll">
        {POLLUTANTS.map((pollutant) => (
          <div className="wx-poll-item" key={pollutant.key}>
            <span className="pl">{pollutant.label}</span>
            <span className="pv">{air.pollutants[pollutant.key] ?? '—'} {air.units[pollutant.key]}</span>
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
  const { t } = useTranslation()

  if (!air) {
    return (
      <CardShell>
        <p className="wx-empty">{t('air.empty')}</p>
      </CardShell>
    )
  }
  return <AqiContent air={air} />
}
