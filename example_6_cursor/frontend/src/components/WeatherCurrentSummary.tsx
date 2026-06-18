import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { getWeatherDescription } from '@/lib/weather-descriptions';
import { WeatherTemperatureBlock } from '@/components/WeatherTemperatureBlock';
import type { WeatherResponse } from '@/types/weather-response';

type WeatherCurrentSummaryProps = {
  weather: WeatherResponse;
};

export function WeatherCurrentSummary({ weather }: WeatherCurrentSummaryProps) {
  const locationLabel = useMemo(
    () => [weather.location.name, weather.location.region, weather.location.country]
      .filter(Boolean)
      .join(', '),
    [weather.location.country, weather.location.name, weather.location.region],
  );

  const description = useMemo(
    () => getWeatherDescription(weather.current.weatherCode),
    [weather.current.weatherCode],
  );

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{locationLabel}</span>
        </div>
        <p className="mt-3 text-lg font-semibold text-foreground">{description}</p>
      </div>
      <WeatherTemperatureBlock weather={weather} />
    </div>
  );
}
