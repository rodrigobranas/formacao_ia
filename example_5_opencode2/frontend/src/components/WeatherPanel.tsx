import { useEffect, useState, useCallback } from 'react'
import { MapPin, Navigation, Loader2, Droplets, Wind, Thermometer } from 'lucide-react'
import { SearchInput } from './SearchInput'
import { WeatherIcon } from './WeatherIcon'
import {
  type WeatherData,
  getWeatherCondition,
  getWeatherLabel,
  formatTemperature,
  formatWind,
} from '@/lib/weather'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface WeatherState {
  status: Status
  data?: WeatherData
  error?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function WeatherPanel() {
  const [state, setState] = useState<WeatherState>({ status: 'idle' })

  const handleSearch = useCallback(async (city: string) => {
    setState({ status: 'loading' })
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/weather?city=${encodeURIComponent(city)}`
      )
      const data = (await response.json()) as WeatherData | { error: string }

      if (!response.ok || 'error' in data) {
        setState({
          status: 'error',
          error: 'error' in data ? data.error : 'Erro ao buscar o clima.',
        })
        return
      }

      setState({ status: 'success', data })
    } catch {
      setState({
        status: 'error',
        error: 'Não foi possível conectar ao servidor.',
      })
    }
  }, [])

  const handleLocate = useCallback(async () => {
    if (!navigator.geolocation) {
      setState({
        status: 'error',
        error: 'Geolocalização não suportada pelo navegador.',
      })
      return
    }

    setState({ status: 'loading' })
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `${API_BASE_URL}/api/weather?lat=${latitude}&lon=${longitude}`
          )
          const data = (await response.json()) as WeatherData | { error: string }

          if (!response.ok || 'error' in data) {
            setState({
              status: 'error',
              error: 'error' in data ? data.error : 'Erro ao buscar o clima.',
            })
            return
          }

          setState({ status: 'success', data })
        } catch {
          setState({
            status: 'error',
            error: 'Não foi possível conectar ao servidor.',
          })
        }
      },
      () => {
        setState({
          status: 'error',
          error: 'Permissão de localização negada.',
        })
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    )
  }, [])

  useEffect(() => {
    let cancelled = false

    const suggestLocation = () => {
      if (navigator.geolocation && !cancelled) {
        navigator.geolocation.getCurrentPosition(
          () => {
            if (cancelled) return
            handleLocate()
          },
          () => {
            // Silently fall back to idle state if location is unavailable.
          }
        )
      }
    }

    suggestLocation()

    return () => {
      cancelled = true
    }
  }, [handleLocate])

  const condition = state.data
    ? getWeatherCondition(state.data.weatherCode)
    : 'unknown'

  return (
    <section className="w-full max-w-2xl">
      <div className="flex flex-col items-center gap-6">
        <header className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Clima
          </h2>
          <p className="mt-1 text-muted-foreground">
            Busque uma cidade ou use sua localização atual.
          </p>
        </header>

        <div className="flex w-full flex-col items-center gap-3">
          <SearchInput onSearch={handleSearch} isLoading={state.status === 'loading'} />

          <button
            onClick={handleLocate}
            disabled={state.status === 'loading'}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-60"
          >
            {state.status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Usar minha localização
          </button>
        </div>

        {state.status === 'error' && (
          <div
            role="alert"
            className="w-full rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {state.error}
          </div>
        )}

        {state.status === 'success' && state.data && (
          <article className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-wide">
                  {state.data.city}
                  {state.data.country && `, ${state.data.country}`}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <WeatherIcon
                  condition={condition}
                  className="h-20 w-20 text-primary"
                />
                <p className="text-lg font-medium text-accent-foreground">
                  {getWeatherLabel(condition)}
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-7xl font-light tracking-tighter text-foreground sm:text-8xl">
                  {Math.round(state.data.temperature)}
                </span>
                <span className="text-3xl font-medium text-muted-foreground">
                  {state.data.unitTemperature.replace('°C', '°')}
                </span>
              </div>

              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/60 p-4 text-center">
                  <div className="mb-1 flex items-center justify-center gap-1.5 text-muted-foreground">
                    <Thermometer className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Sensação
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatTemperature(
                      state.data.apparentTemperature,
                      state.data.unitTemperature
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-muted/60 p-4 text-center">
                  <div className="mb-1 flex items-center justify-center gap-1.5 text-muted-foreground">
                    <Droplets className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Umidade
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {state.data.humidity}
                    {state.data.unitHumidity}
                  </p>
                </div>

                <div className="rounded-xl bg-muted/60 p-4 text-center">
                  <div className="mb-1 flex items-center justify-center gap-1.5 text-muted-foreground">
                    <Wind className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Vento
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatWind(state.data.windSpeed, state.data.unitWindSpeed)}
                  </p>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  )
}
