import { useMemo } from 'react'
import type { CurrentWeather } from '@/types/current-weather'
import type { DailyForecast } from '@/types/daily-forecast'
import { formatTemperature, formatPercent, formatMeasure, formatCardinal } from '@/lib/format'
import { useTranslation } from 'react-i18next'

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
  const { t, i18n } = useTranslation()
  const wind = useMemo(
    () => `${formatMeasure(current.wind_speed, windUnit)} ${formatCardinal(current.wind_direction, i18n.language)}`,
    [current.wind_speed, current.wind_direction, windUnit, i18n.language],
  )
  const rainChance = useMemo(
    () => (today ? today.precipitation_probability_max : null),
    [today],
  )

  return (
    <div className="wx-hero-quick">
      <QuickStat label={t('metrics.feelsLike')} value={formatTemperature(current.apparent_temperature)} />
      <QuickStat label={t('metrics.wind')} value={wind} />
      <QuickStat label={t('metrics.humidity')} value={formatPercent(current.humidity)} />
      <QuickStat label={t('metrics.rainChance')} value={formatPercent(rainChance)} />
    </div>
  )
}
