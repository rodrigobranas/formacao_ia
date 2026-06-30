import { useMemo } from 'react'
import { Clock, Droplet } from 'lucide-react'
import type { HourlyForecast } from '@/types/hourly-forecast'
import { WeatherIcon } from '@/lib/weather-icon'
import { formatTemperature, formatTime, formatPercent } from '@/lib/format'
import { useTranslation } from 'react-i18next'

const COLUMN_WIDTH = 58
const BAND_HEIGHT = 70
const PAD_TOP = 26
const PAD_BOTTOM = 16

type Curve = { line: string; points: number[][]; width: number; topFor: (temp: number) => number }

function buildCurve(temps: number[]): Curve {
  const min = Math.min(...temps)
  const range = Math.max(...temps) - min || 1
  const yOf = (temp: number) => PAD_TOP + (1 - (temp - min) / range) * (BAND_HEIGHT - PAD_TOP - PAD_BOTTOM)
  const points = temps.map((temp, index) => [index * COLUMN_WIDTH + COLUMN_WIDTH / 2, yOf(temp)])
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  return { line, points, width: temps.length * COLUMN_WIDTH, topFor: (temp) => yOf(temp) - 20 }
}

function CurveSvg({ curve }: { curve: Curve }) {
  const area = `${curve.line} L${curve.width} ${BAND_HEIGHT} L0 ${BAND_HEIGHT} Z`
  return (
    <svg className="wx-hg-line" width={curve.width} height={BAND_HEIGHT} viewBox={`0 0 ${curve.width} ${BAND_HEIGHT}`} aria-hidden="true">
      <defs>
        <linearGradient id="wx-hg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--wx-accent)" stopOpacity=".22" />
          <stop offset="1" stopColor="var(--wx-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#wx-hg)" />
      <path d={curve.line} fill="none" stroke="var(--wx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HourColumn({ hour, isNow, labelTop, locale }: { hour: HourlyForecast; isNow: boolean; labelTop: number; locale: string }) {
  const { t } = useTranslation()

  return (
    <div className={isNow ? 'wx-hgc now' : 'wx-hgc'}>
      <div className="wx-hg-band">
        <span className="wx-hg-temp" style={{ top: labelTop }}>{formatTemperature(hour.temperature)}</span>
      </div>
      <div className="wx-hg-ic">
        <WeatherIcon code={hour.weather_code} isDay={hour.is_day === 1} size={26} />
      </div>
      <div className="wx-hg-time">{isNow ? t('hourly.now') : formatTime(hour.time, locale)}</div>
      <div className="wx-hg-pop">
        {hour.precipitation_probability >= 5 && (
          <>
            <Droplet aria-hidden="true" />
            {formatPercent(hour.precipitation_probability)}
          </>
        )}
      </div>
    </div>
  )
}

type HourlyForecastCardProps = {
  hours: HourlyForecast[]
}

export function HourlyForecastCard({ hours }: HourlyForecastCardProps) {
  const { t, i18n } = useTranslation()
  const curve = useMemo(() => buildCurve(hours.map((hour) => hour.temperature)), [hours])

  return (
    <section className="wx-card" aria-label={t('hourly.title')}>
      <div className="wx-card-h">
        <Clock className="ic" aria-hidden="true" />
        <h3>{t('hourly.title')}</h3>
        <span className="meta">{t('hourly.meta')}</span>
      </div>
      <div className="wx-hourly-scroll" tabIndex={0} role="group" aria-label={t('hourly.scrollLabel')}>
        <div className="wx-hourly-track" style={{ width: curve.width }}>
          <CurveSvg curve={curve} />
          <div className="wx-hg-row">
            {hours.map((hour, index) => (
              <HourColumn key={hour.time} hour={hour} isNow={index === 0} labelTop={curve.topFor(hour.temperature)} locale={i18n.language} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
