import { useMemo, type CSSProperties } from 'react'
import { RefreshCw } from 'lucide-react'
import type { CurrentWeather } from '@/types/current-weather'
import type { DailyForecast } from '@/types/daily-forecast'
import type { GeoResult } from '@/types/geo-result'
import { WeatherIcon } from '@/lib/weather-icon'
import { skyForCode } from '@/lib/sky'
import { roundTemperature, formatTemperature } from '@/lib/format'
import { translateApiLabel } from '@/i18n/translate-api-label'
import { HeroQuickStats } from './hero-quick-stats'
import { useTranslation } from 'react-i18next'

type WeatherHeroProps = {
  location: GeoResult
  current: CurrentWeather
  today: DailyForecast | null
  windUnit: string
  onRefresh: () => void
}

function HeroHeader({
  location,
  locationName,
  onRefresh,
}: {
  location: GeoResult
  locationName: string
  onRefresh: () => void
}) {
  const { t } = useTranslation()
  const region = [location.admin1, location.country].filter(Boolean).join(' · ')
  return (
    <div className="wx-hero-top">
      <div className="wx-loc">
        <div className="name">{locationName}</div>
        <div className="sub">{region}</div>
      </div>
      <button type="button" className="wx-refresh" onClick={onRefresh}>
        <RefreshCw aria-hidden="true" /> {t('hero.refresh')}
      </button>
    </div>
  )
}

function HeroReadout({ current, today }: { current: CurrentWeather; today: DailyForecast | null }) {
  const { t } = useTranslation()
  const condition = translateApiLabel(current.condition.label, t)

  return (
    <div className="wx-hero-body">
      <div className="wx-temp-block">
        <div className="wx-temp">
          {roundTemperature(current.temperature)}
          <span className="deg">°</span>
        </div>
        <div className="wx-temp-side">
          <div className="wx-cond">{condition}</div>
          <div className="wx-hilo">
            <span>{t('hero.max')} <b>{formatTemperature(today?.temp_max ?? null)}</b></span>
            <span>{t('hero.min')} <b>{formatTemperature(today?.temp_min ?? null)}</b></span>
          </div>
        </div>
      </div>
      <div className="wx-hero-ic">
        <WeatherIcon code={current.condition.code} isDay={current.is_day === 1} size={150} label={condition} />
      </div>
    </div>
  )
}

export function WeatherHero({ location, current, today, windUnit, onRefresh }: WeatherHeroProps) {
  const { t } = useTranslation()
  const isDay = current.is_day === 1
  const sky = useMemo(() => skyForCode(current.condition.code, isDay), [current.condition.code, isDay])
  const skyStyle = { '--sky-1': sky.from, '--sky-2': sky.via, '--sky-3': sky.to } as CSSProperties
  const locationName = translateApiLabel(location.name, t)

  return (
    <section className="wx-hero" aria-live="polite" aria-label={t('hero.currentWeatherLabel', { location: locationName })} style={skyStyle}>
      <HeroHeader location={location} locationName={locationName} onRefresh={onRefresh} />
      <HeroReadout current={current} today={today} />
      <HeroQuickStats current={current} today={today} windUnit={windUnit} />
    </section>
  )
}
