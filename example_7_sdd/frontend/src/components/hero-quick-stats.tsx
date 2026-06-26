import { useMemo } from 'react'
import type { CurrentWeather } from '@/types/current-weather'
import type { DailyForecast } from '@/types/daily-forecast'
import { formatTemperature, formatPercent, formatMeasure, formatCardinal } from '@/lib/format'

type HeroQuickStatsProps = {
  current: CurrentWeather
  today: DailyForecast | null
  windUnit: string
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="wx-hq">
      <span className="l">{label}</span>
      <span className="v">{value}</span>
    </div>
  )
}

export function HeroQuickStats({ current, today, windUnit }: HeroQuickStatsProps) {
  const wind = useMemo(
    () => `${formatMeasure(current.wind_speed, windUnit)} ${formatCardinal(current.wind_direction)}`,
    [current.wind_speed, current.wind_direction, windUnit],
  )
  const rainChance = useMemo(
    () => (today ? today.precipitation_probability_max : null),
    [today],
  )

  return (
    <div className="wx-hero-quick">
      <QuickStat label="Sensação" value={formatTemperature(current.apparent_temperature)} />
      <QuickStat label="Vento" value={wind} />
      <QuickStat label="Umidade" value={formatPercent(current.humidity)} />
      <QuickStat label="Prob. de chuva" value={formatPercent(rainChance)} />
    </div>
  )
}
