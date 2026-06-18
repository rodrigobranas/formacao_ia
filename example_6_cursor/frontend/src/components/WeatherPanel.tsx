import { CloudSun } from 'lucide-react';
import { WeatherDisplay } from '@/components/WeatherDisplay';
import { WeatherSearchForm } from '@/components/WeatherSearchForm';
import { useWeather } from '@/hooks/useWeather';
import { useWeatherMetrics } from '@/hooks/useWeatherMetrics';

export function WeatherPanel() {
  const {
    city,
    setCity,
    weather,
    status,
    errorMessage,
    searchByCity,
    requestUserLocation,
  } = useWeather();

  const metrics = useWeatherMetrics(weather);

  return (
    <section className="grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 text-foreground">
          <CloudSun className="h-6 w-6 text-amber-500" />
          <span className="text-sm font-semibold uppercase tracking-[0.16em]">Busca</span>
        </div>
        <WeatherSearchForm
          city={city}
          errorMessage={errorMessage}
          onCityChange={setCity}
          onSearch={searchByCity}
          onUseLocation={requestUserLocation}
          status={status}
        />
      </div>
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
        <WeatherDisplay metrics={metrics} status={status} weather={weather} />
      </div>
    </section>
  );
}
