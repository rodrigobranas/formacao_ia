import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  AlertCircle,
  Droplets,
  LoaderCircle,
  MapPin,
  Navigation,
  Search,
  Thermometer,
  Wind,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  fetchWeatherByCity,
  fetchWeatherByCoordinates,
  formatLocation,
  getWeatherVisuals,
  type WeatherResult,
} from '@/lib/weather'

type Status = 'idle' | 'loading' | 'success' | 'error'

function WeatherPanel() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [data, setData] = useState<WeatherResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)
  const didAutoLocate = useRef(false)

  async function loadByCity(city: string) {
    setStatus('loading')
    setError(null)
    try {
      const result = await fetchWeatherByCity(city)
      setData(result)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar o clima.')
      setStatus('error')
    }
  }

  async function loadByCoords(
    latitude: number,
    longitude: number,
    { silent = false }: { silent?: boolean } = {},
  ) {
    setStatus('loading')
    setError(null)
    try {
      const result = await fetchWeatherByCoordinates(latitude, longitude)
      setData(result)
      setStatus('success')
    } catch (err) {
      if (silent) {
        // Auto-location is best-effort: fall back to the idle prompt quietly.
        setStatus((current) => (current === 'success' ? current : 'idle'))
        return
      }
      setError(err instanceof Error ? err.message : 'Erro ao buscar o clima.')
      setStatus('error')
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const city = query.trim()
    if (!city) return
    void loadByCity(city)
  }

  function handleGeolocate({ silent = false }: { silent?: boolean } = {}) {
    if (!('geolocation' in navigator)) {
      if (!silent) {
        setError('Geolocalização não é suportada neste navegador.')
        setStatus('error')
      }
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        void loadByCoords(
          position.coords.latitude,
          position.coords.longitude,
          { silent },
        )
      },
      () => {
        setLocating(false)
        if (!silent) {
          setError(
            'Não foi possível obter sua localização. Busque por uma cidade.',
          )
          setStatus('error')
        }
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
    )
  }

  // On first mount, try to suggest the user's location automatically.
  useEffect(() => {
    if (didAutoLocate.current) return
    didAutoLocate.current = true
    handleGeolocate({ silent: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card text-card-foreground shadow-xl overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Painel de Clima</h2>
          <p className="text-sm text-muted-foreground">
            Informe uma cidade para ver o clima atual.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: São Paulo"
            aria-label="Cidade"
            autoComplete="off"
          />
          <Button type="submit" disabled={status === 'loading' || !query.trim()}>
            {status === 'loading' ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Search />
            )}
            <span className="sr-only sm:not-sr-only">Buscar</span>
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleGeolocate()}
          disabled={locating || status === 'loading'}
        >
          {locating ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Navigation />
          )}
          Usar minha localização
        </Button>
      </div>

      <WeatherDisplay status={status} data={data} error={error} />
    </div>
  )
}

interface WeatherDisplayProps {
  status: Status
  data: WeatherResult | null
  error: string | null
}

function WeatherDisplay({ status, data, error }: WeatherDisplayProps) {
  if (status === 'error') {
    return (
      <div className="flex items-start gap-3 border-t border-border bg-destructive/10 p-6 text-destructive">
        <AlertCircle className="mt-0.5 size-5 shrink-0" />
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (status === 'loading' && !data) {
    return (
      <div className="flex items-center justify-center gap-2 border-t border-border p-10 text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
        <span className="text-sm">Carregando clima…</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="border-t border-border p-10 text-center text-sm text-muted-foreground">
        Nenhuma cidade selecionada ainda.
      </div>
    )
  }

  const { location, current } = data
  const { Icon, gradient } = getWeatherVisuals(current.weatherCode, current.isDay)

  return (
    <div className="border-t border-border">
      <div
        className={`bg-gradient-to-br ${gradient} p-6 text-white transition-opacity ${
          status === 'loading' ? 'opacity-60' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-1.5 text-sm font-medium text-white/90">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{formatLocation(location)}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-5xl font-bold leading-none">
              {Math.round(current.temperature)}
              <span className="align-top text-2xl">{current.units.temperature}</span>
            </div>
            <div className="mt-2 text-sm text-white/90">
              {current.weatherDescription}
            </div>
          </div>
          <Icon className="size-20 shrink-0 drop-shadow" strokeWidth={1.5} />
        </div>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-border border-t border-border text-center">
        <Detail
          icon={<Thermometer className="size-4" />}
          label="Sensação"
          value={`${Math.round(current.apparentTemperature)}${current.units.temperature}`}
        />
        <Detail
          icon={<Droplets className="size-4" />}
          label="Umidade"
          value={`${current.humidity}${current.units.humidity}`}
        />
        <Detail
          icon={<Wind className="size-4" />}
          label="Vento"
          value={`${Math.round(current.windSpeed)} ${current.units.windSpeed}`}
        />
      </dl>
    </div>
  )
}

interface DetailProps {
  icon: ReactNode
  label: string
  value: string
}

function Detail({ icon, label, value }: DetailProps) {
  return (
    <div className="flex flex-col items-center gap-1 p-4">
      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-base font-semibold">{value}</dd>
    </div>
  )
}

export default WeatherPanel
