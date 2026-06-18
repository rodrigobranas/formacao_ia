import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  CloudSun,
  Droplets,
  Gauge,
  Loader2,
  LocateFixed,
  MapPin,
  Search,
  Thermometer,
  Wind,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const API_BASE_URL = 'http://localhost:3000'

type ApiStatus = 'checking' | 'online' | 'offline'
type WeatherStatus = 'idle' | 'loading' | 'success' | 'error'

type WeatherResponse = {
  location: {
    name: string
    country: string | null
    region: string | null
    latitude: number
    longitude: number
    timezone: string
  }
  current: {
    time: string
    temperature: number
    apparentTemperature: number
    relativeHumidity: number
    precipitation: number
    weatherCode: number
    windSpeed: number
    windDirection: number
    isDay: boolean
  }
  units: {
    temperature: string
    apparentTemperature: string
    relativeHumidity: string
    precipitation: string
    windSpeed: string
    windDirection: string
  }
}

type Metric = {
  label: string
  value: string
  icon: typeof Thermometer
  tone: string
}

const weatherDescriptions: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Poucas nuvens',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina com gelo',
  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve forte',
  80: 'Pancadas fracas',
  81: 'Pancadas moderadas',
  82: 'Pancadas fortes',
  95: 'Tempestade',
  96: 'Tempestade com granizo',
  99: 'Tempestade severa',
}

const getWeatherDescription = (code: number) => weatherDescriptions[code] ?? 'Condição atual'

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  const [city, setCity] = useState('São Paulo')
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch(API_BASE_URL + '/health')
        setApiStatus(response.ok ? 'online' : 'offline')
      } catch {
        setApiStatus('offline')
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchWeather = async (params: URLSearchParams) => {
    setWeatherStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch(API_BASE_URL + '/weather?' + params.toString())
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? 'Não foi possível buscar o clima.')
      }

      setWeather(data as WeatherResponse)
      setWeatherStatus('success')
    } catch (error) {
      setWeatherStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível buscar o clima.')
    }
  }

  useEffect(() => {
    void fetchWeather(new URLSearchParams({ city: 'São Paulo' }))
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedCity = city.trim()

    if (normalizedCity.length === 0) {
      setWeatherStatus('error')
      setErrorMessage('Informe uma cidade.')
      return
    }

    void fetchWeather(new URLSearchParams({ city: normalizedCity }))
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setWeatherStatus('error')
      setErrorMessage('Geolocalização não está disponível neste navegador.')
      return
    }

    setWeatherStatus('loading')
    setErrorMessage('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void fetchWeather(
          new URLSearchParams({
            latitude: String(position.coords.latitude),
            longitude: String(position.coords.longitude),
          })
        )
      },
      () => {
        setWeatherStatus('error')
        setErrorMessage('Não foi possível obter sua localização.')
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    )
  }

  const metrics = useMemo<Metric[]>(() => {
    if (!weather) {
      return []
    }

    return [
      {
        label: 'Sensação',
        value: Math.round(weather.current.apparentTemperature) + weather.units.apparentTemperature,
        icon: Thermometer,
        tone: 'text-amber-600 bg-amber-50',
      },
      {
        label: 'Umidade',
        value: weather.current.relativeHumidity + weather.units.relativeHumidity,
        icon: Droplets,
        tone: 'text-cyan-700 bg-cyan-50',
      },
      {
        label: 'Vento',
        value: Math.round(weather.current.windSpeed) + ' ' + weather.units.windSpeed,
        icon: Wind,
        tone: 'text-emerald-700 bg-emerald-50',
      },
      {
        label: 'Chuva',
        value: weather.current.precipitation + ' ' + weather.units.precipitation,
        icon: Gauge,
        tone: 'text-violet-700 bg-violet-50',
      },
    ]
  }, [weather])

  const statusLabel = {
    checking: 'Verificando API',
    online: 'API online',
    offline: 'API offline',
  }[apiStatus]

  const statusColor = {
    checking: 'bg-yellow-500',
    online: 'bg-green-500',
    offline: 'bg-red-500',
  }[apiStatus]

  const locationLabel = weather
    ? [weather.location.name, weather.location.region, weather.location.country].filter(Boolean).join(', ')
    : 'Cidade'

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">IA para Devs</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Painel de clima</h1>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <span className={['h-2.5 w-2.5 rounded-full', statusColor].join(' ')} />
            <span className="text-sm font-medium text-slate-600">{statusLabel}</span>
          </div>
        </header>

        <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:items-stretch">
          <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <div className="flex items-center gap-3 text-slate-700">
                <CloudSun className="h-6 w-6 text-amber-500" />
                <span className="text-sm font-semibold uppercase tracking-[0.16em]">Busca</span>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-slate-700" htmlFor="city">
                  Cidade
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="city"
                      className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-base outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Ex.: Lisboa"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                    />
                  </div>
                  <Button className="h-11 shrink-0" disabled={weatherStatus === 'loading'} type="submit">
                    {weatherStatus === 'loading' ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Search />
                    )}
                    Buscar
                  </Button>
                </div>
              </form>

              <Button
                className="mt-4 h-11 w-full justify-center sm:w-auto"
                disabled={weatherStatus === 'loading'}
                onClick={handleUseLocation}
                type="button"
                variant="outline"
              >
                <LocateFixed />
                Usar minha localização
              </Button>

              {weatherStatus === 'error' && (
                <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {errorMessage}
                </p>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div className="rounded-md bg-slate-100 px-3 py-2">
                <span className="block font-medium text-slate-950">Fonte</span>
                Open-Meteo
              </div>
              <div className="rounded-md bg-slate-100 px-3 py-2">
                <span className="block font-medium text-slate-950">Rota</span>
                /weather
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {weatherStatus === 'loading' && !weather ? (
              <div className="flex h-full min-h-[360px] items-center justify-center text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Carregando clima
              </div>
            ) : weather ? (
              <div className="flex h-full flex-col">
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <MapPin className="h-4 w-4" />
                      <span>{locationLabel}</span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-slate-700">
                      {getWeatherDescription(weather.current.weatherCode)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-6xl font-semibold leading-none text-slate-950">
                      {Math.round(weather.current.temperature)}
                      <span className="text-3xl">{weather.units.temperature}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {weather.current.isDay ? 'Dia' : 'Noite'} · {weather.location.timezone}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 py-5 sm:grid-cols-2">
                  {metrics.map((metric) => {
                    const Icon = metric.icon

                    return (
                      <div className="rounded-md border border-slate-200 p-4" key={metric.label}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-slate-500">{metric.label}</span>
                          <span className={['rounded-md p-2', metric.tone].join(' ')}>
                            <Icon className="h-4 w-4" />
                          </span>
                        </div>
                        <p className="mt-4 text-2xl font-semibold text-slate-950">{metric.value}</p>
                      </div>
                    )
                  })}
                </div>

                <dl className="mt-auto grid gap-3 border-t border-slate-200 pt-5 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="font-medium text-slate-500">Atualizado</dt>
                    <dd className="mt-1 text-slate-950">{new Date(weather.current.time).toLocaleString('pt-BR')}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Latitude</dt>
                    <dd className="mt-1 text-slate-950">{weather.location.latitude.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Longitude</dt>
                    <dd className="mt-1 text-slate-950">{weather.location.longitude.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center text-slate-500">
                Selecione uma cidade
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
