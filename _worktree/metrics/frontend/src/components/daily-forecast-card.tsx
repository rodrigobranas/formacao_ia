import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import type { DailyForecast } from '@/types/daily-forecast'
import { useUnitPreference } from '@/hooks/use-unit-preference'
import { WeatherIcon } from '@/lib/weather-icon'
import { labelForCode } from '@/lib/weather-code'
import { formatTemperature, formatPercent, formatWeekday } from '@/lib/format'
import { convertTemperature } from '@/lib/units'

type DailyRowProps = {
  day: DailyForecast
  isToday: boolean
  weekMin: number
  weekSpan: number
  rangeMin: number
  rangeMax: number
}

function DailyRow({ day, isToday, weekMin, weekSpan, rangeMin, rangeMax }: DailyRowProps) {
  const { unitSystem } = useUnitPreference()
  const left = ((rangeMin - weekMin) / weekSpan) * 100
  const width = Math.max(8, ((rangeMax - rangeMin) / weekSpan) * 100)
  const hasRain = day.precipitation_probability_max > 0
  return (
    <div className="wx-drow">
      <div className={isToday ? 'wx-dday today' : 'wx-dday'}>{isToday ? 'Hoje' : formatWeekday(day.date)}</div>
      <div className="wx-dic">
        <WeatherIcon code={day.weather_code} isDay size={24} label={labelForCode(day.weather_code)} />
      </div>
      <div className={hasRain ? 'wx-dpop' : 'wx-dpop zero'}>{hasRain ? formatPercent(day.precipitation_probability_max) : '—'}</div>
      <div className="wx-drange">
        <span className="lo">{formatTemperature(day.temp_min, unitSystem)}</span>
        <span className="bar"><i className="fill" style={{ left: `${left}%`, width: `${width}%` }} /></span>
        <span className="hi">{formatTemperature(day.temp_max, unitSystem)}</span>
      </div>
    </div>
  )
}

type DailyForecastCardProps = {
  days: DailyForecast[]
}

export function DailyForecastCard({ days }: DailyForecastCardProps) {
  const { unitSystem } = useUnitPreference()
  const range = useMemo(() => {
    const convertedDays = days.map((day) => ({
      date: day.date,
      tempMin: convertTemperature(day.temp_min, unitSystem) ?? 0,
      tempMax: convertTemperature(day.temp_max, unitSystem) ?? 0,
    }))
    const weekMin = Math.min(...convertedDays.map((day) => day.tempMin))
    const weekSpan = Math.max(...convertedDays.map((day) => day.tempMax)) - weekMin || 1
    const byDate = new Map(convertedDays.map((day) => [day.date, { min: day.tempMin, max: day.tempMax }]))
    return { weekMin, weekSpan, byDate }
  }, [days, unitSystem])

  return (
    <section className="wx-card" aria-label="Previsão de 7 dias">
      <div className="wx-card-h">
        <Calendar className="ic" aria-hidden="true" />
        <h3>Previsão de 7 dias</h3>
      </div>
      <div className="wx-daily">
        {days.map((day, index) => (
          <DailyRow
            key={day.date}
            day={day}
            isToday={index === 0}
            weekMin={range.weekMin}
            weekSpan={range.weekSpan}
            rangeMin={range.byDate.get(day.date)?.min ?? 0}
            rangeMax={range.byDate.get(day.date)?.max ?? 0}
          />
        ))}
      </div>
    </section>
  )
}
