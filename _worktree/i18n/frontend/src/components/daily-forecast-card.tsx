import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import type { DailyForecast } from '@/types/daily-forecast'
import { WeatherIcon } from '@/lib/weather-icon'
import { labelKeyForCode } from '@/lib/weather-code'
import { formatTemperature, formatPercent, formatWeekday } from '@/lib/format'
import { useTranslation } from 'react-i18next'

type DailyRowProps = {
  day: DailyForecast
  isToday: boolean
  weekMin: number
  weekSpan: number
}

function DailyRow({ day, isToday, weekMin, weekSpan }: DailyRowProps) {
  const { t, i18n } = useTranslation()
  const left = ((day.temp_min - weekMin) / weekSpan) * 100
  const width = Math.max(8, ((day.temp_max - day.temp_min) / weekSpan) * 100)
  const hasRain = day.precipitation_probability_max > 0
  const conditionLabel = t(labelKeyForCode(day.weather_code))

  return (
    <div className="wx-drow">
      <div className={isToday ? 'wx-dday today' : 'wx-dday'}>{isToday ? t('daily.today') : formatWeekday(day.date, i18n.language)}</div>
      <div className="wx-dic">
        <WeatherIcon code={day.weather_code} isDay size={24} label={conditionLabel} />
      </div>
      <div className={hasRain ? 'wx-dpop' : 'wx-dpop zero'}>{hasRain ? formatPercent(day.precipitation_probability_max) : '—'}</div>
      <div className="wx-drange">
        <span className="lo">{formatTemperature(day.temp_min)}</span>
        <span className="bar"><i className="fill" style={{ left: `${left}%`, width: `${width}%` }} /></span>
        <span className="hi">{formatTemperature(day.temp_max)}</span>
      </div>
    </div>
  )
}

type DailyForecastCardProps = {
  days: DailyForecast[]
}

export function DailyForecastCard({ days }: DailyForecastCardProps) {
  const { t } = useTranslation()
  const range = useMemo(() => {
    const weekMin = Math.min(...days.map((day) => day.temp_min))
    const weekSpan = Math.max(...days.map((day) => day.temp_max)) - weekMin || 1
    return { weekMin, weekSpan }
  }, [days])

  return (
    <section className="wx-card" aria-label={t('daily.title')}>
      <div className="wx-card-h">
        <Calendar className="ic" aria-hidden="true" />
        <h3>{t('daily.title')}</h3>
      </div>
      <div className="wx-daily">
        {days.map((day, index) => (
          <DailyRow key={day.date} day={day} isToday={index === 0} weekMin={range.weekMin} weekSpan={range.weekSpan} />
        ))}
      </div>
    </section>
  )
}
