import { useEffect, useState, type FormEvent } from 'react';
import {
  Search,
  MapPin,
  Droplets,
  Wind,
  Thermometer,
  Loader2,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getWeatherDescription, getWeatherIcon, formatDate } from '@/lib/weather';
import type { WeatherData } from '@/types/weather';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type LoadingState = 'idle' | 'loading' | 'locating';

export function WeatherPanel() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadingState>('idle');

  async function fetchWeather(url: string, locationLabel?: string) {
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch(url);
      const data = (await response.json()) as WeatherData | { message: string };

      if (!response.ok) {
        throw new Error('message' in data ? data.message : 'Erro ao buscar clima');
      }

      setWeather(data as WeatherData);
      if (locationLabel) {
        setCity(locationLabel);
      }
    } catch (err) {
      setWeather(null);
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setStatus('idle');
    }
  }

  function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    if (!city.trim()) return;
    void fetchWeather(`${API_URL}/api/weather?city=${encodeURIComponent(city.trim())}`);
  }

  function handleGeolocation() {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo navegador');
      return;
    }

    setStatus('locating');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        void fetchWeather(
          `${API_URL}/api/weather?lat=${latitude}&lon=${longitude}`,
          'Sua localização'
        );
      },
      (err) => {
        setStatus('idle');
        setError(`Não foi possível obter a localização: ${err.message}`);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }

  useEffect(() => {
    void fetchWeather(`${API_URL}/api/weather?city=São Paulo`, 'São Paulo');
  }, []);

  const CurrentIcon = weather
    ? getWeatherIcon(weather.current.weatherCode, weather.current.isDay)
    : null;

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Digite uma cidade..."
            className={cn(
              'w-full rounded-md border border-input bg-background px-9 py-2 text-sm',
              'ring-offset-background placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          />
        </div>
        <Button type="submit" disabled={status !== 'idle' || !city.trim()}>
          {status === 'loading' && city ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          <span className="hidden sm:inline">Buscar</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleGeolocation}
          disabled={status !== 'idle'}
          title="Usar minha localização"
        >
          {status === 'locating' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Navigation className="size-4" />
          )}
        </Button>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {weather && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {weather.city ?? 'Localização atual'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {[weather.region, weather.country].filter(Boolean).join(', ') ||
                    `${weather.latitude.toFixed(2)}, ${weather.longitude.toFixed(2)}`}
                </p>
              </div>
              {CurrentIcon && (
                <CurrentIcon
                  className={cn(
                    'size-16',
                    weather.current.isDay ? 'text-yellow-500' : 'text-indigo-400'
                  )}
                />
              )}
            </div>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-6xl font-bold">
                {Math.round(weather.current.temperature)}°
              </span>
              <span className="text-lg text-muted-foreground mb-2">
                {getWeatherDescription(weather.current.weatherCode)}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center rounded-lg bg-secondary/50 p-3">
                <Thermometer className="size-4 text-muted-foreground mb-1" />
                <span className="text-sm font-medium">
                  {Math.round(weather.current.apparentTemperature)}°
                </span>
                <span className="text-xs text-muted-foreground">Sensação</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-secondary/50 p-3">
                <Droplets className="size-4 text-muted-foreground mb-1" />
                <span className="text-sm font-medium">{weather.current.humidity}%</span>
                <span className="text-xs text-muted-foreground">Umidade</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-secondary/50 p-3">
                <Wind className="size-4 text-muted-foreground mb-1" />
                <span className="text-sm font-medium">{weather.current.windSpeed} km/h</span>
                <span className="text-xs text-muted-foreground">Vento</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <MapPin className="size-4" />
              Previsão para os próximos dias
            </h3>
            <div className="grid gap-2">
              {weather.forecast.map((day) => {
                const DayIcon = getWeatherIcon(day.weatherCode, true);
                return (
                  <div
                    key={day.date}
                    className="flex items-center justify-between rounded-lg border bg-card p-3"
                  >
                    <span className="text-sm font-medium w-24 capitalize">
                      {formatDate(day.date)}
                    </span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DayIcon className="size-4" />
                      <span className="text-xs hidden sm:inline">
                        {getWeatherDescription(day.weatherCode)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">{Math.round(day.maxTemperature)}°</span>
                      <span className="text-muted-foreground">
                        {Math.round(day.minTemperature)}°
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!weather && status === 'idle' && !error && (
        <div className="text-center text-muted-foreground text-sm py-12">
          Busque uma cidade ou use sua localização para ver o clima.
        </div>
      )}
    </div>
  );
}
