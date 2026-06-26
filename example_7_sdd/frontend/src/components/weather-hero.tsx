import { useMemo, type CSSProperties } from 'react'
import { RefreshCw } from 'lucide-react'
import type { CurrentWeather } from '@/types/current-weather'
import type { DailyForecast } from '@/types/daily-forecast'
import type { GeoResult } from '@/types/geo-result'
import { WeatherIcon } from '@/lib/weather-icon'
import { skyForCode } from '@/lib/sky'
import { roundTemperature, formatTemperature } from '@/lib/format'
import { HeroQuickStats } from './hero-quick-stats'

type WeatherHeroProps = {
  location: GeoResult
  current: CurrentWeather
  today: DailyForecast | null
  windUnit: string
  onRefresh: () => void
}

function HeroHeader({ location, onRefresh }: { location: GeoResult; onRefresh: () => void }) {
  const region = [location.admin1, location.country].filter(Boolean).join(' · ')
  return (
    <div className="wx-hero-top">
      <div className="wx-loc">
        <div className="name">{location.name}</div>
        <div className="sub">{region}</div>
      </div>
      <button type="button" className="wx-refresh" onClick={onRefresh}>
        <RefreshCw aria-hidden="true" /> Atualizar
      </button>
    </div>
  )
}

function HeroReadout({ current, today }: { current: CurrentWeather; today: DailyForecast | null }) {
  return (
    <div className="wx-hero-body">
      <div className="wx-temp-block">
        <div className="wx-temp">
          {roundTemperature(current.temperature)}
          <span className="deg">°</span>
        </div>
        <div className="wx-temp-side">
          <div className="wx-cond">{current.condition.label}</div>
          <div className="wx-hilo">
            <span>Máx <b>{formatTemperature(today?.temp_max ?? null)}</b></span>
            <span>Mín <b>{formatTemperature(today?.temp_min ?? null)}</b></span>
          </div>
        </div>
      </div>
      <div className="wx-hero-ic">
        <WeatherIcon code={current.condition.code} isDay={current.is_day === 1} size={150} label={current.condition.label} />
      </div>
    </div>
  )
}

export function WeatherHero({ location, current, today, windUnit, onRefresh }: WeatherHeroProps) {
  const isDay = current.is_day === 1
  const sky = useMemo(() => skyForCode(current.condition.code, isDay), [current.condition.code, isDay])
  const skyStyle = { '--sky-1': sky.from, '--sky-2': sky.via, '--sky-3': sky.to } as CSSProperties

  return (
    <section className="wx-hero" aria-live="polite" aria-label={`Clima atual em ${location.name}`} style={skyStyle}>
      <HeroHeader location={location} onRefresh={onRefresh} />
      <HeroReadout current={current} today={today} />
      <HeroQuickStats current={current} today={today} windUnit={windUnit} />
    </section>
  )
}
