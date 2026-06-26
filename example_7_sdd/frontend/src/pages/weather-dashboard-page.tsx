import { useCallback, useMemo } from 'react'
import type { GeoResult } from '@/types/geo-result'
import type { WeatherRequest } from '@/types/weather-request'
import type { GeolocationStatus } from '@/types/geolocation-status'
import type { WeatherPayload } from '@/types/weather-payload'
import { useApiStatus } from '@/hooks/use-api-status'
import { useWeather } from '@/hooks/use-weather'
import { useCitySearch } from '@/hooks/use-city-search'
import { useGeolocation } from '@/hooks/use-geolocation'
import { TopBar } from '@/components/top-bar'
import { CitySearch } from '@/components/city-search'
import { GeolocationButton } from '@/components/geolocation-button'
import { ApiStatusPill } from '@/components/api-status-pill'
import { WeatherHero } from '@/components/weather-hero'
import { HourlyForecastCard } from '@/components/hourly-forecast-card'
import { DailyForecastCard } from '@/components/daily-forecast-card'
import { DetailedMetricsCard } from '@/components/detailed-metrics-card'
import { SunArcCard } from '@/components/sun-arc-card'
import { AirQualityCard } from '@/components/air-quality-card'
import { ErrorToast } from '@/components/error-toast'
import { LoadingSkeletons } from '@/components/loading-skeletons'

type WeatherController = ReturnType<typeof useWeather>

const GEO_NOTICE: Partial<Record<GeolocationStatus, string>> = {
  denied: 'Permissão de localização negada. Continue buscando uma cidade manualmente.',
  unsupported: 'Geolocalização não suportada neste navegador. Busque uma cidade.',
}

function toRequest(result: GeoResult): WeatherRequest {
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    admin1: result.admin1,
    country: result.country,
    country_code: result.country_code,
  }
}

function GeoNotice({ status }: { status: GeolocationStatus }) {
  const message = GEO_NOTICE[status]
  if (!message) {
    return null
  }
  return <p className="wx-empty" role="status" style={{ textAlign: 'left' }}>{message}</p>
}

function IdlePlaceholder() {
  return <p className="wx-empty">Busque uma cidade ou use sua localização para ver o clima.</p>
}

function WeatherContent({ data, onRefresh }: { data: WeatherPayload; onRefresh: () => void }) {
  return (
    <>
      <WeatherHero location={data.location} current={data.current} today={data.daily[0] ?? null} windUnit={data.units.wind_speed} onRefresh={onRefresh} />
      <div className="wx-grid"><HourlyForecastCard hours={data.hourly} /></div>
      <div className="wx-cols">
        <DailyForecastCard days={data.daily} />
        <DetailedMetricsCard current={data.current} uv={data.extras.uv} windUnit={data.units.wind_speed} />
      </div>
      <div className="wx-lower-split">
        <SunArcCard sunrise={data.extras.sun.sunrise} sunset={data.extras.sun.sunset} currentTime={data.current.time} />
        <AirQualityCard air={data.extras.air} />
      </div>
    </>
  )
}

function DashboardContent({ weather }: { weather: WeatherController }) {
  if (weather.status === 'loading') {
    return <LoadingSkeletons />
  }
  if (weather.status === 'error' && weather.error?.code === 'city_not_found') {
    return <p className="wx-empty">Não encontramos essa cidade. Verifique a grafia e tente novamente.</p>
  }
  if (weather.status !== 'success' || !weather.data) {
    return <IdlePlaceholder />
  }
  return <WeatherContent data={weather.data} onRefresh={weather.retry} />
}

export function WeatherDashboardPage() {
  const apiStatus = useApiStatus()
  const weather = useWeather()
  const search = useCitySearch()
  const geo = useGeolocation(weather.loadPlace)

  const handleSelect = useCallback(
    (result: GeoResult) => {
      search.setTerm('')
      weather.loadPlace(toRequest(result))
    },
    [search, weather],
  )

  const showToast = useMemo(
    () => weather.status === 'error' && weather.error?.code !== 'city_not_found',
    [weather.status, weather.error],
  )

  return (
    <div className="wx-app">
      <TopBar
        searchSlot={<CitySearch term={search.term} status={search.status} results={search.results} onTermChange={search.setTerm} onSelect={handleSelect} />}
        actionsSlot={<><ApiStatusPill status={apiStatus} /><GeolocationButton status={geo.status} onClick={geo.requestLocation} /></>}
      />
      <GeoNotice status={geo.status} />
      <DashboardContent weather={weather} />
      {showToast && weather.error && (
        <ErrorToast message={weather.error.message} recoverable onRetry={weather.retry} />
      )}
    </div>
  )
}
